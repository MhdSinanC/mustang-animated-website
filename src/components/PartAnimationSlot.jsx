import { useState, useRef, useEffect } from 'react'
import { useMotionValueEvent, motion, useTransform } from 'framer-motion'

const PART_COLORS = [
  { accent: '#ff0000', label: 'Engine' },
  { accent: '#0055FF', label: 'Drivetrain' },
  { accent: '#00D4AA', label: 'Suspension' },
  { accent: '#FFB800', label: 'Brakes' },
  { accent: '#ff0000', label: 'Aerodynamics' },
]

export default function PartAnimationSlot({ activePartIndexValue }) {
  // We no longer need local activePart state since all parts are mounted simultaneously.
  // This allows them all to preload their massive image sequences in the background!
  
  // We still need the accent color to update, though.
  const [activePart, setActivePart] = useState(0)
  if (activePartIndexValue) {
    useMotionValueEvent(activePartIndexValue, "change", (latest) => {
      setActivePart(Math.floor(latest))
    })
  }
  const config = PART_COLORS[activePart] || PART_COLORS[0]

  return (
    <div
      id="spec-part-animation-slot"
      className="w-full h-full bg-black overflow-hidden relative transition-all duration-700 ease-in-out"
      style={{ '--part-accent': config.accent }}
    >
      {/* Part-specific illustration container - Full Screen */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full opacity-100 transition-opacity duration-700 relative">
          <PartIllustration activePartIndexValue={activePartIndexValue} accent={config.accent} />
        </div>
      </div>
    </div>
  )
}

function PartIllustration({ activePartIndexValue, accent }) {
  // Staggered loading state: prevents 1500 images from downloading at once!
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [engineLoaded, setEngineLoaded] = useState(false)
  const [drivetrainLoaded, setDrivetrainLoaded] = useState(false)
  const [suspensionLoaded, setSuspensionLoaded] = useState(false)
  const [brakesLoaded, setBrakesLoaded] = useState(false)

  useEffect(() => {
    const handleHero = () => setHeroLoaded(true)
    window.addEventListener('heroLoaded', handleHero)
    // Fallback just in case hero takes too long or already fired before this mounted
    const timeout = setTimeout(() => setHeroLoaded(true), 5000)
    
    return () => {
      window.removeEventListener('heroLoaded', handleHero)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <EngineIllustration 
          activePartIndexValue={activePartIndexValue} 
          accent={accent} 
          shouldLoad={heroLoaded} 
          onLoaded={() => setEngineLoaded(true)} 
        />
      </div>
      <div className="absolute inset-0 z-20 pointer-events-none">
        <DrivetrainIllustration 
          activePartIndexValue={activePartIndexValue} 
          accent={accent} 
          shouldLoad={engineLoaded} 
          onLoaded={() => setDrivetrainLoaded(true)} 
        />
      </div>
      
      <div className="absolute inset-0 z-30 pointer-events-none">
        <SuspensionIllustration 
          activePartIndexValue={activePartIndexValue} 
          accent={accent} 
          shouldLoad={drivetrainLoaded} 
          onLoaded={() => setSuspensionLoaded(true)} 
        />
      </div>

      <div className="absolute inset-0 z-40 pointer-events-none">
        <BrakeIllustration 
          activePartIndexValue={activePartIndexValue} 
          accent={accent} 
          shouldLoad={suspensionLoaded} 
          onLoaded={() => setBrakesLoaded(true)} 
        />
      </div>

      <div className="absolute inset-0 z-50 pointer-events-none">
        <AeroIllustration 
          activePartIndexValue={activePartIndexValue} 
          accent={accent} 
          shouldLoad={brakesLoaded} 
        />
      </div>
    </>
  )
}

function EngineIllustration({ activePartIndexValue, accent, shouldLoad, onLoaded }) {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const frameCount = 300

  // Preload frames
  useEffect(() => {
    if (!shouldLoad) return;
    let loadedCount = 0
    const loadedImages = []

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      const paddedIndex = i.toString().padStart(3, '0')
      img.src = `/images/engine/ezgif-frame-${paddedIndex}.jpg`
      
      img.onload = () => {
        loadedCount++
        if (loadedCount === frameCount) {
          setImages(loadedImages)
          setLoaded(true)
          if (onLoaded) onLoaded()
        }
      }
      loadedImages.push(img)
    }
  }, [shouldLoad, onLoaded])

  // Draw initial frame
  useEffect(() => {
    if (loaded && images.length > 0) {
      renderFrame(0)
    }
  }, [loaded])

  // Scrub through frames based on activePartIndexValue (which goes from 0 to 4.99)
  // For the engine, we only care about the scroll segment from 0 to 1
  if (activePartIndexValue) {
    useMotionValueEvent(activePartIndexValue, "change", (latest) => {
      if (!loaded || images.length === 0) return
      
      // Clamp between 0 and 1
      const progress = Math.min(1, Math.max(0, latest))
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
      requestAnimationFrame(() => renderFrame(frameIndex))
    })
  }

  const renderFrame = (index) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    const img = images[index]
    if (!img) return

    // We can just use the canvas size as drawn in the DOM
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const hRatio = canvas.width / img.width
    const vRatio = canvas.height / img.height
    
    // Scale up to crop empty black space around the engine.
    // On mobile (<768px), use 1.5x since the text is at the extreme top/bottom.
    // On desktop, use 1.15x so it stays smaller and doesn't overlap the diagonal HUD text.
    const isMobile = window.innerWidth < 768
    const scaleFactor = isMobile ? 1.5 : 1.15
    const ratio = Math.min(hRatio, vRatio) * scaleFactor

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
      if (loaded && images.length > 0 && activePartIndexValue) {
        const latest = activePartIndexValue.get()
        const progress = Math.min(1, Math.max(0, latest))
        const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
        renderFrame(frameIndex)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [loaded, images, activePartIndexValue])

  // Fade out smoothly just like the text overlay when approaching the next spec
  const opacity = activePartIndexValue ? useTransform(activePartIndexValue, [0.8, 0.99], [1, 0]) : 1;

  return (
    <motion.div style={{ opacity }} className="w-full h-full relative flex items-center justify-center">
      {!loaded && (
        <div className="absolute z-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
          <span className="font-mono-tech text-[10px] tracking-widest uppercase" style={{ color: accent }}>
            LOADING ENGINE...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-contain"
      />
    </motion.div>
  )
}

function DrivetrainIllustration({ activePartIndexValue, accent, shouldLoad, onLoaded }) {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const frameCount = 300

  // Preload frames
  useEffect(() => {
    if (!shouldLoad) return;
    let loadedCount = 0
    const loadedImages = []

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      const paddedIndex = i.toString().padStart(3, '0')
      img.src = `/images/gear/ezgif-frame-${paddedIndex}.jpg`
      
      img.onload = () => {
        loadedCount++
        if (loadedCount === frameCount) {
          setImages(loadedImages)
          setLoaded(true)
          if (onLoaded) onLoaded()
        }
      }
      loadedImages.push(img)
    }
  }, [shouldLoad, onLoaded])

  // Draw initial frame
  useEffect(() => {
    if (loaded && images.length > 0) {
      renderFrame(0)
    }
  }, [loaded])

  // Scrub through frames based on activePartIndexValue (which goes from 0 to 4.99)
  // For the drivetrain (index 1), we care about the scroll segment from 1 to 2
  if (activePartIndexValue) {
    useMotionValueEvent(activePartIndexValue, "change", (latest) => {
      if (!loaded || images.length === 0) return
      
      // Map the 1.0 to 2.0 range down to 0.0 to 1.0 for the progress
      const progress = Math.min(1, Math.max(0, latest - 1))
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
      requestAnimationFrame(() => renderFrame(frameIndex))
    })
  }

  const renderFrame = (index) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    const img = images[index]
    if (!img) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const hRatio = canvas.width / img.width
    const vRatio = canvas.height / img.height
    
    // Scale up to crop empty black space
    const isMobile = window.innerWidth < 768
    const scaleFactor = isMobile ? 1.5 : 1.15
    const ratio = Math.min(hRatio, vRatio) * scaleFactor

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
      if (loaded && images.length > 0 && activePartIndexValue) {
        const latest = activePartIndexValue.get()
        const progress = Math.min(1, Math.max(0, latest - 1))
        const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
        renderFrame(frameIndex)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [loaded, images, activePartIndexValue])

  // Strict fade bounds so it doesn't render over the engine!
  const opacity = activePartIndexValue ? useTransform(activePartIndexValue, [0.99, 1.0, 1.8, 1.99], [0, 1, 1, 0]) : 1;

  return (
    <motion.div style={{ opacity }} className="w-full h-full relative flex items-center justify-center">
      {!loaded && (
        <div className="absolute z-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
          <span className="font-mono-tech text-[10px] tracking-widest uppercase" style={{ color: accent }}>
            LOADING GEAR...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-contain"
      />
    </motion.div>
  )
}

function SuspensionIllustration({ activePartIndexValue, accent, shouldLoad, onLoaded }) {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const frameCount = 300

  // Preload frames
  useEffect(() => {
    if (!shouldLoad) return;
    let loadedCount = 0
    const loadedImages = []

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      const paddedIndex = i.toString().padStart(3, '0')
      img.src = `/images/suspension/ezgif-frame-${paddedIndex}.jpg`
      
      img.onload = () => {
        loadedCount++
        if (loadedCount === frameCount) {
          setImages(loadedImages)
          setLoaded(true)
          if (onLoaded) onLoaded()
        }
      }
      loadedImages.push(img)
    }
  }, [shouldLoad, onLoaded])

  // Draw initial frame
  useEffect(() => {
    if (loaded && images.length > 0) {
      renderFrame(0)
    }
  }, [loaded])

  // Scrub through frames based on activePartIndexValue (which goes from 0 to 4.99)
  // For the suspension (index 2), we care about the scroll segment from 2 to 3
  if (activePartIndexValue) {
    useMotionValueEvent(activePartIndexValue, "change", (latest) => {
      if (!loaded || images.length === 0) return
      
      // Map the 2.0 to 3.0 range down to 0.0 to 1.0 for the progress
      const progress = Math.min(1, Math.max(0, latest - 2))
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
      requestAnimationFrame(() => renderFrame(frameIndex))
    })
  }

  const renderFrame = (index) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    const img = images[index]
    if (!img) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const hRatio = canvas.width / img.width
    const vRatio = canvas.height / img.height
    
    // Scale up to crop empty black space
    const isMobile = window.innerWidth < 768
    const scaleFactor = isMobile ? 1.5 : 1.15
    const ratio = Math.min(hRatio, vRatio) * scaleFactor

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
      if (loaded && images.length > 0 && activePartIndexValue) {
        const latest = activePartIndexValue.get()
        const progress = Math.min(1, Math.max(0, latest - 2))
        const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
        renderFrame(frameIndex)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [loaded, images, activePartIndexValue])

  // Strict fade bounds so it doesn't render over the drivetrain or brakes!
  const opacity = activePartIndexValue ? useTransform(activePartIndexValue, [1.99, 2.0, 2.8, 2.99], [0, 1, 1, 0]) : 1;

  return (
    <motion.div style={{ opacity }} className="w-full h-full relative flex items-center justify-center">
      {!loaded && (
        <div className="absolute z-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
          <span className="font-mono-tech text-[10px] tracking-widest uppercase" style={{ color: accent }}>
            LOADING SUSPENSION...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-contain"
      />
    </motion.div>
  )
}

function BrakeIllustration({ activePartIndexValue, accent, shouldLoad, onLoaded }) {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const frameCount = 300

  // Preload frames
  useEffect(() => {
    if (!shouldLoad) return;
    let loadedCount = 0
    const loadedImages = []

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      const paddedIndex = i.toString().padStart(3, '0')
      img.src = `/images/Piston/ezgif-frame-${paddedIndex}.jpg`
      
      img.onload = () => {
        loadedCount++
        if (loadedCount === frameCount) {
          setImages(loadedImages)
          setLoaded(true)
          if (onLoaded) onLoaded()
        }
      }
      loadedImages.push(img)
    }
  }, [shouldLoad, onLoaded])

  // Draw initial frame
  useEffect(() => {
    if (loaded && images.length > 0) {
      renderFrame(0)
    }
  }, [loaded])

  // Scrub through frames based on activePartIndexValue (which goes from 0 to 4.99)
  // For the brakes (index 3), we care about the scroll segment from 3 to 4
  if (activePartIndexValue) {
    useMotionValueEvent(activePartIndexValue, "change", (latest) => {
      if (!loaded || images.length === 0) return
      
      // Map the 3.0 to 4.0 range down to 0.0 to 1.0 for the progress
      const progress = Math.min(1, Math.max(0, latest - 3))
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
      requestAnimationFrame(() => renderFrame(frameIndex))
    })
  }

  const renderFrame = (index) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    const img = images[index]
    if (!img) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const hRatio = canvas.width / img.width
    const vRatio = canvas.height / img.height
    
    // Scale up to crop empty black space
    const isMobile = window.innerWidth < 768
    const scaleFactor = isMobile ? 1.5 : 1.15
    const ratio = Math.min(hRatio, vRatio) * scaleFactor

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
      if (loaded && images.length > 0 && activePartIndexValue) {
        const latest = activePartIndexValue.get()
        const progress = Math.min(1, Math.max(0, latest - 3))
        const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
        renderFrame(frameIndex)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [loaded, images, activePartIndexValue])

  // Strict fade bounds so it doesn't render over the suspension or aero!
  const opacity = activePartIndexValue ? useTransform(activePartIndexValue, [2.99, 3.0, 3.8, 3.99], [0, 1, 1, 0]) : 1;

  return (
    <motion.div style={{ opacity }} className="w-full h-full relative flex items-center justify-center">
      {!loaded && (
        <div className="absolute z-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
          <span className="font-mono-tech text-[10px] tracking-widest uppercase" style={{ color: accent }}>
            LOADING BRAKES...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-contain"
      />
    </motion.div>
  )
}

function AeroIllustration({ activePartIndexValue, accent, shouldLoad }) {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const frameCount = 300

  // Preload frames
  useEffect(() => {
    if (!shouldLoad) return;
    let loadedCount = 0
    const loadedImages = []

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      const paddedIndex = i.toString().padStart(3, '0')
      img.src = `/images/aero balance/ezgif-frame-${paddedIndex}.jpg`
      
      img.onload = () => {
        loadedCount++
        if (loadedCount === frameCount) {
          setImages(loadedImages)
          setLoaded(true)
        }
      }
      loadedImages.push(img)
    }
  }, [shouldLoad])

  // Draw initial frame
  useEffect(() => {
    if (loaded && images.length > 0) {
      renderFrame(0)
    }
  }, [loaded])

  // Scrub through frames based on activePartIndexValue (which goes from 0 to 4.99)
  // For aero (index 4), we care about the scroll segment from 4 to 5
  if (activePartIndexValue) {
    useMotionValueEvent(activePartIndexValue, "change", (latest) => {
      if (!loaded || images.length === 0) return
      
      // Map the 4.0 to 5.0 range down to 0.0 to 1.0 for the progress
      const progress = Math.min(1, Math.max(0, latest - 4))
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
      requestAnimationFrame(() => renderFrame(frameIndex))
    })
  }

  const renderFrame = (index) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    const img = images[index]
    if (!img) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const hRatio = canvas.width / img.width
    const vRatio = canvas.height / img.height
    
    // Scale up to crop empty black space
    const isMobile = window.innerWidth < 768
    const scaleFactor = isMobile ? 1.5 : 1.15
    const ratio = Math.min(hRatio, vRatio) * scaleFactor

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
      if (loaded && images.length > 0 && activePartIndexValue) {
        const latest = activePartIndexValue.get()
        const progress = Math.min(1, Math.max(0, latest - 4))
        const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount))
        renderFrame(frameIndex)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [loaded, images, activePartIndexValue])

  // Strict fade bounds so it doesn't render over the brakes!
  // Since it's the last section, it doesn't need to fade out at 4.99, it can just stay at 1.
  const opacity = activePartIndexValue ? useTransform(activePartIndexValue, [3.99, 4.0], [0, 1]) : 1;

  return (
    <motion.div style={{ opacity }} className="w-full h-full relative flex items-center justify-center">
      {!loaded && (
        <div className="absolute z-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
          <span className="font-mono-tech text-[10px] tracking-widest uppercase" style={{ color: accent }}>
            LOADING AERO...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-contain"
      />
    </motion.div>
  )
}
