import { useRef, useEffect, useState, useCallback } from 'react'
import { useMotionValueEvent } from 'framer-motion'

const TOTAL_FRAMES = 300
const MAX_CONCURRENT_LOADS = 4

// In-memory module cache to persist loaded frames across responsive resize toggles
const globalMobileFrameCache = new Map()

// Generate frame path based on 1-based index: ezgif-frame-001.jpg ... ezgif-frame-300.jpg
const getFramePath = (index) => {
  const frameNumber = index + 1
  const paddedIndex = String(frameNumber).padStart(3, '0')
  return `/mobile-herosection/ezgif-frame-${paddedIndex}.jpg`
}

export default function MobileHeroAnimationSlot({ scrollProgress }) {
  const [firstFrameReady, setFirstFrameReady] = useState(() => globalMobileFrameCache.has(0))
  const [bgColor, setBgColor] = useState('#000000')

  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  const isMountedRef = useRef(true)
  const isVisibleRef = useRef(true)
  const isAnimatingRef = useRef(false)
  const rafIdRef = useRef(null)

  // Floating frame position for buttery lerp interpolation (0 to TOTAL_FRAMES - 1)
  const currentFrameRef = useRef(0)
  const targetFrameRef = useRef(0)
  const lastDrawnIndexRef = useRef(-1)

  // Preloading queue management
  const loadingQueueRef = useRef([])
  const activeLoadsCountRef = useRef(0)
  const inFlightIndicesRef = useRef(new Set())

  // Fast image loader with async decoding
  const loadImage = useCallback((index) => {
    if (index < 0 || index >= TOTAL_FRAMES) return Promise.resolve(null)
    if (globalMobileFrameCache.has(index)) {
      return Promise.resolve(globalMobileFrameCache.get(index))
    }

    return new Promise((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      const primaryUrl = getFramePath(index)
      img.src = primaryUrl

      img.onload = () => {
        globalMobileFrameCache.set(index, img)
        resolve(img)
      }

      img.onerror = () => {
        // Fallback to /images/mobile-herosection/ in case server path aliasing differs
        const fallbackImg = new Image()
        fallbackImg.decoding = 'async'
        fallbackImg.src = `/images/mobile-herosection/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`
        fallbackImg.onload = () => {
          globalMobileFrameCache.set(index, fallbackImg)
          resolve(fallbackImg)
        }
        fallbackImg.onerror = () => {
          resolve(null)
        }
      }
    })
  }, [])

  // Find closest loaded frame to completely prevent blank frames or flickering
  const getClosestLoadedImage = useCallback((targetIndex) => {
    if (globalMobileFrameCache.has(targetIndex)) {
      return globalMobileFrameCache.get(targetIndex)
    }

    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIndex - offset
      if (prev >= 0 && globalMobileFrameCache.has(prev)) {
        return globalMobileFrameCache.get(prev)
      }
      const next = targetIndex + offset
      if (next < TOTAL_FRAMES && globalMobileFrameCache.has(next)) {
        return globalMobileFrameCache.get(next)
      }
    }
    return null
  }, [])

  // Optimized Canvas render with aspect-ratio cover math and High-DPI support
  const drawCanvas = useCallback((img) => {
    const canvas = canvasRef.current
    if (!canvas || !img || !img.complete || (img.naturalWidth === 0 && img.width === 0)) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const width = rect.width || window.innerWidth
    const height = rect.height || window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const displayWidth = Math.round(width * dpr)
    const displayHeight = Math.round(height * dpr)

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth
      canvas.height = displayHeight
    }

    const imgWidth = img.naturalWidth || img.width || 1080
    const imgHeight = img.naturalHeight || img.height || 1920

    // Equivalent of object-fit: cover
    const scale = Math.max(displayWidth / imgWidth, displayHeight / imgHeight)
    const drawWidth = imgWidth * scale
    const drawHeight = imgHeight * scale
    const offsetX = (displayWidth - drawWidth) / 2
    const offsetY = (displayHeight - drawHeight) / 2

    ctx.drawImage(img, 0, 0, imgWidth, imgHeight, offsetX, offsetY, drawWidth, drawHeight)
  }, [])

  // Render given target frame index
  const renderFrameIndex = useCallback((index) => {
    const safeIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, index))
    const img = getClosestLoadedImage(safeIndex)
    if (img) {
      drawCanvas(img)
      lastDrawnIndexRef.current = safeIndex
    }
  }, [getClosestLoadedImage, drawCanvas])

  // Queue pump: process pending downloads respecting concurrency limit
  const pumpQueue = useCallback(() => {
    if (!isMountedRef.current || !isVisibleRef.current) return

    while (
      activeLoadsCountRef.current < MAX_CONCURRENT_LOADS &&
      loadingQueueRef.current.length > 0
    ) {
      const nextIndex = loadingQueueRef.current.shift()
      if (globalMobileFrameCache.has(nextIndex) || inFlightIndicesRef.current.has(nextIndex)) {
        continue
      }

      inFlightIndicesRef.current.add(nextIndex)
      activeLoadsCountRef.current++

      loadImage(nextIndex).then((loadedImg) => {
        inFlightIndicesRef.current.delete(nextIndex)
        activeLoadsCountRef.current--

        if (isMountedRef.current && loadedImg) {
          // If the image just loaded is the one we currently want to display, redraw now
          const currentWanted = Math.round(currentFrameRef.current)
          if (Math.abs(currentWanted - nextIndex) <= 1) {
            renderFrameIndex(currentWanted)
          }
        }

        pumpQueue()
      })
    }
  }, [loadImage, renderFrameIndex])

  // Prioritize frames around the current scrub position
  const prioritizeFrames = useCallback((centerIndex) => {
    const queue = []
    const visited = new Set()

    // 1. Immediate neighborhood: ±12 frames centered at target position
    for (let offset = 0; offset <= 12; offset++) {
      const forward = centerIndex + offset
      if (forward < TOTAL_FRAMES && !globalMobileFrameCache.has(forward) && !visited.has(forward)) {
        queue.push(forward)
        visited.add(forward)
      }
      const backward = centerIndex - offset
      if (backward >= 0 && !globalMobileFrameCache.has(backward) && !visited.has(backward)) {
        queue.push(backward)
        visited.add(backward)
      }
    }

    // 2. Keyframes across the sequence (every 10 frames)
    for (let i = 0; i < TOTAL_FRAMES; i += 10) {
      if (!globalMobileFrameCache.has(i) && !visited.has(i)) {
        queue.push(i)
        visited.add(i)
      }
    }

    // 3. Progressive remaining frames from 0 to 299
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (!globalMobileFrameCache.has(i) && !visited.has(i)) {
        queue.push(i)
        visited.add(i)
      }
    }

    loadingQueueRef.current = queue
    pumpQueue()
  }, [pumpQueue])

  // Smooth lerp animation loop using requestAnimationFrame
  const animationLoop = useCallback(() => {
    if (!isMountedRef.current || !isVisibleRef.current) {
      isAnimatingRef.current = false
      return
    }

    const target = targetFrameRef.current
    const current = currentFrameRef.current
    const diff = target - current

    if (Math.abs(diff) > 0.05) {
      // 0.35 lerp factor offers snappy responsiveness with cinematic continuity
      currentFrameRef.current = current + diff * 0.35
      const frameToDraw = Math.round(currentFrameRef.current)
      renderFrameIndex(frameToDraw)
      rafIdRef.current = requestAnimationFrame(animationLoop)
    } else {
      currentFrameRef.current = target
      renderFrameIndex(Math.round(target))
      isAnimatingRef.current = false
    }
  }, [renderFrameIndex])

  // Scrub through frames based on scrollProgress MotionValue
  useMotionValueEvent(scrollProgress, "change", (latest) => {
    const clamped = Math.max(0, Math.min(1, latest))
    const target = clamped * (TOTAL_FRAMES - 1)
    targetFrameRef.current = target

    // Prioritize loading frames in user's scroll direction
    prioritizeFrames(Math.round(target))

    if (!isAnimatingRef.current && isVisibleRef.current) {
      isAnimatingRef.current = true
      rafIdRef.current = requestAnimationFrame(animationLoop)
    }
  })

  // Initial load: Load Frame 1 immediately, then initiate progressive preloader
  useEffect(() => {
    isMountedRef.current = true

    // Calculate initial target from scrollProgress
    const initialProgress = scrollProgress ? Math.max(0, Math.min(1, scrollProgress.get())) : 0
    const initialTarget = initialProgress * (TOTAL_FRAMES - 1)
    targetFrameRef.current = initialTarget
    currentFrameRef.current = initialTarget

    const initFrameIndex = Math.round(initialTarget)

    loadImage(initFrameIndex).then((img) => {
      if (!isMountedRef.current) return
      setFirstFrameReady(true)

      if (img) {
        drawCanvas(img)

        // Sample background color from edge
        try {
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = 1
          tempCanvas.height = 1
          const ctx = tempCanvas.getContext('2d')
          ctx.drawImage(img, 0, 0, 1, 1)
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
          setBgColor(`rgb(${r}, ${g}, ${b})`)
        } catch {
          // Ignore
        }
      }

      // Signal heroLoaded so sequential specs preloading can start
      window.dispatchEvent(new Event('heroLoaded'))

      // Preload initial buffer and keyframes
      prioritizeFrames(initFrameIndex)
    })

    return () => {
      isMountedRef.current = false
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [loadImage, drawCanvas, prioritizeFrames, scrollProgress])

  // Pause rAF and background loading when hero is completely out of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          const frameToDraw = Math.round(currentFrameRef.current)
          renderFrameIndex(frameToDraw)
          pumpQueue()
        } else {
          if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current)
            isAnimatingRef.current = false
          }
        }
      },
      { threshold: 0.01 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [renderFrameIndex, pumpQueue])

  // Handle window resize and mobile orientation changes cleanly
  useEffect(() => {
    const handleResize = () => {
      const frameToDraw = Math.round(currentFrameRef.current)
      renderFrameIndex(frameToDraw)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [renderFrameIndex])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full flex items-center justify-center transition-colors duration-1000"
      style={{ backgroundColor: bgColor }}
    >
      {!firstFrameReady && (
        <div className="absolute z-10 flex flex-col items-center gap-4 pointer-events-none">
          <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono-tech text-[10px] text-[#ff0000] tracking-widest uppercase">
            INITIALIZING MOBILE EXPERIENCE...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-cover"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
