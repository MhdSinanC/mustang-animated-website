import { useScroll, useMotionValueEvent, motion, useTransform } from 'framer-motion'
import { useState } from 'react'

export default function HUDOverlay({ accentColor }) {
  const { scrollYProgress, scrollY } = useScroll()
  const [scrollPercent, setScrollPercent] = useState(0)

  // Fade out top "navbar" elements when user scrolls down
  const topNavOpacity = useTransform(scrollY, [0, 500], [1, 0])

  // Fade out bottom telemetry text exactly when approaching the specs section, and fade back in at bottom
  const bottomTelemetryOpacity = useTransform(
    scrollYProgress, 
    [0.2, 0.28, 0.95, 0.99], 
    [1, 0, 0, 1]
  )

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollPercent(Math.round(latest * 100))
  })

  // Fallback to red if accentColor is not provided (e.g. before SpecsSection mounts)
  const defaultBorderColor = 'rgba(255, 0, 0, 0.5)'

  return (
    <div className="fixed inset-0 pointer-events-none z-[9000]">
      {/* Corner Brackets */}
      <motion.div style={{ borderColor: accentColor || defaultBorderColor }} className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2" />
      <motion.div style={{ borderColor: accentColor || defaultBorderColor }} className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2" />
      <motion.div style={{ borderColor: accentColor || defaultBorderColor }} className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2" />
      <motion.div style={{ borderColor: accentColor || defaultBorderColor }} className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2" />

      {/* Top Navbar elements (Fades out on scroll) */}
      <motion.div style={{ opacity: topNavOpacity }}>
        {/* Top Left: Logo/Project Name */}
        <div className="absolute top-8 left-16 flex flex-col pointer-events-auto">
          <span className="font-racing text-xl text-white tracking-widest leading-none drop-shadow-md">SHELBY</span>
          <span className="font-mono-tech text-[10px] text-[#ff0000] tracking-[0.4em] uppercase">GT350 · PROJECT VOODOO</span>
        </div>

        {/* Top Right: Status / Recording */}
        <div className="absolute top-8 right-16 flex items-center gap-3">
          <span className="font-mono-tech text-[10px] text-white tracking-[0.3em] uppercase">SYSTEM ONLINE</span>
          <div className="w-2 h-2 rounded-full bg-[#ff0000] animate-pulse-red" />
        </div>
      </motion.div>

      {/* Right Rail: Scroll Telemetry */}
      <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4">
        <span className="font-mono-tech text-[9px] text-[#ff0000] tracking-[0.3em] uppercase rotate-90 origin-center mb-6">
          SCROLL Y_
        </span>
        <div className="w-px h-32 bg-neutral-900 relative">
          <motion.div 
            className="absolute top-0 w-1 bg-[#ff0000] -left-[1.5px]"
            style={{ height: `${scrollPercent}%` }}
          />
        </div>
        <span className="font-mono-tech text-[10px] text-white tracking-widest mt-6">
          {String(scrollPercent).padStart(3, '0')}%
        </span>
      </div>

      {/* Bottom Left: Coordinates / Data */}
      <motion.div style={{ opacity: bottomTelemetryOpacity }} className="absolute bottom-8 left-16 flex flex-col">
        <span className="font-mono-tech text-[9px] text-neutral-600 tracking-[0.2em] uppercase">LAT: 36.2300° N | LON: 115.0069° W</span>
        <span className="font-mono-tech text-[9px] text-neutral-600 tracking-[0.2em] uppercase mt-1">SHELBY AMERICAN INC. / LAS VEGAS</span>
      </motion.div>
      
    </div>
  )
}
