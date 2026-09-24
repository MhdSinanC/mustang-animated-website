import { useRef, useEffect, useState } from 'react'
import { useMotionValueEvent } from 'framer-motion'

export default function HeroAnimationSlot({ scrollProgress }) {
  const [bgColor, setBgColor] = useState('#000000')
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const frameCount = 300

  // Preload all 300 frames
  useEffect(() => {
    let loadedCount = 0
    const loadedImages = []

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      const paddedIndex = i.toString().padStart(3, '0')
      img.src = `/images/herosection/ezgif-frame-${paddedIndex}.png`
      
      img.onload = () => {
        loadedCount++
        if (loadedCount === frameCount) {
          setImages(loadedImages)
          setLoaded(true)
          
          // Sample background color from first image once loaded
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = 1
          tempCanvas.height = 1
          const ctx = tempCanvas.getContext('2d')
          ctx.drawImage(img, 0, 0, 1, 1)
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
          setBgColor(`rgb(${r}, ${g}, ${b})`)
        }
      }
      loadedImages.push(img)
    }
  }, [])

  // Draw the initial frame once loaded
  useEffect(() => {
    if (loaded && images.length > 0 && canvasRef.current) {
      renderFrame(0)
    }
  }, [loaded])

  // Scrub through frames based on scroll
  useMotionValueEvent(scrollProgress, "change", (latest) => {
    if (!loaded || images.length === 0) return
    const frameIndex = Math.min(frameCount - 1, Math.floor(latest * frameCount))
    requestAnimationFrame(() => renderFrame(frameIndex))
  })

  const renderFrame = (index) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    const img = images[index]
    if (!img) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const hRatio = canvas.width / img.width
    const vRatio = canvas.height / img.height
    let ratio = Math.max(hRatio, vRatio)

    if (canvas.height > canvas.width) {
      const safeMobileRatio = (canvas.width * 1.35) / img.width
      ratio = Math.min(vRatio, safeMobileRatio)
    }

    const centerShift_x = (canvas.width - img.width * ratio) / 2
    const centerShift_y = (canvas.height - img.height * ratio) / 2

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
      img,
      0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
    )
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (loaded && images.length > 0) {
        const latest = scrollProgress.get()
        const frameIndex = Math.min(frameCount - 1, Math.floor(latest * frameCount))
        renderFrame(frameIndex)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [loaded, images])

  return (
    <div 
      className="absolute inset-0 w-full h-full flex items-center justify-center transition-colors duration-1000"
      style={{ backgroundColor: bgColor }}
    >
      {!loaded && (
        <div className="absolute z-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono-tech text-[10px] text-[#ff0000] tracking-widest uppercase">
            LOADING FRAMES...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-cover"
      />
    </div>
  )
}
