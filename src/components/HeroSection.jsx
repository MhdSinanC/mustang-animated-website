import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import HeroAnimationSlot from './HeroAnimationSlot'

const QUOTES = [
  {
    text: "THE V8 ENGINE HAS BEEN REDEFINED.",
    start: 0.1,
    end: 0.25
  },
  {
    text: "A 5.2L FLAT-PLANE CRANK V8 HOWL.",
    start: 0.35,
    end: 0.5
  },
  {
    text: "8,250 RPM. PURE ADRENALINE.",
    start: 0.6,
    end: 0.75
  },
  {
    text: "UNBRIDLED PRECISION. PURE V8 FURY.",
    start: 0.85,
    end: 1.0
  }
]

function ScrollQuote({ quote, scrollYProgress }) {
  // Fade in at 'start', stay solid, fade out at 'end'
  const opacity = useTransform(
    scrollYProgress,
    [quote.start - 0.05, quote.start, quote.end - 0.05, quote.end],
    [0, 1, 1, 0]
  )
  const y = useTransform(
    scrollYProgress,
    [quote.start - 0.05, quote.end],
    [50, -50]
  )

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div className="text-center px-6 mt-[35vh] sm:mt-0">
        <h2 className="font-racing text-3xl sm:text-6xl lg:text-7xl text-white drop-shadow-2xl max-w-4xl leading-tight">
          {quote.text}
        </h2>
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Fade out the entire hero section as we reach the very end of it
  const opacityContainer = useTransform(scrollYProgress, [0.95, 1], [1, 0])

  // Completely wipe the scroll indicator from the DOM the second they start scrolling
  const [hasScrolled, setHasScrolled] = useState(false)
  
  if (scrollYProgress) {
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
      if (latest > 0.001 && !hasScrolled) {
        setHasScrolled(true)
      } else if (latest <= 0.001 && hasScrolled) {
        // Bring it back if they scroll all the way to the absolute top
        setHasScrolled(false)
      }
    })
  }

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative h-[400vh] w-full bg-black z-10"
    >
      {/* Sticky Full-Screen Viewport for Canvas and Overlays */}
      <motion.div 
        style={{ opacity: opacityContainer }}
        className="sticky top-0 h-dvh w-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* Fullscreen Canvas Animation */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <HeroAnimationSlot scrollProgress={scrollYProgress} />
        </div>

        {/* Quotes Overlays */}
        <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex items-center justify-center">
          {QUOTES.map((quote, i) => (
            <ScrollQuote key={i} quote={quote} scrollYProgress={scrollYProgress} />
          ))}
        </div>

        {/* Scroll indicator - Completely removed from DOM upon scrolling */}
        {!hasScrolled && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 pointer-events-none"
          >
            <span className="font-mono-tech text-[10px] tracking-[0.4em] text-neutral-500 uppercase">
              SCROLL TO IGNITE
            </span>
            <div className="w-px h-16 bg-neutral-800 relative overflow-hidden">
              <div className="absolute top-0 w-full h-1/3 bg-[#ff0000] animate-scan" style={{ animationDuration: '2s' }} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
