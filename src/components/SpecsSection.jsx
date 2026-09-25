import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion'
import PartAnimationSlot from './PartAnimationSlot'

const SPEC_CARDS = [
  {
    index: 0,
    tag: '01 — THE HEART',
    title: 'VOODOO V8',
    subtitle: '5.2L Flat-Plane Crank Engine',
    accent: '#ff0000',
    metrics: [
      { value: '526', unit: 'HP', label: 'Peak Power' },
      { value: '429', unit: 'LB-FT', label: 'Torque' },
      { value: '8,250', unit: 'RPM', label: 'Redline' },
    ],
  },
  {
    index: 1,
    tag: '02 — THE BACKBONE',
    title: 'TREMEC TR-3160',
    subtitle: '6-Speed Manual & Torsen® Diff',
    accent: '#0055FF',
    metrics: [
      { value: '6-SPD', unit: '', label: 'Manual' },
      { value: '3.73', unit: ':1', label: 'LSD Axle' },
      { value: 'DMF', unit: '', label: 'Flywheel' },
    ],
  },
  {
    index: 2,
    tag: '03 — PRECISION STANCE',
    title: 'MAGNERIDE™',
    subtitle: 'Adaptive Magnetic Damping',
    accent: '#00D4AA',
    metrics: [
      { value: '1,000', unit: '/s', label: 'Adjustments' },
      { value: 'MRF', unit: '', label: 'Fluid' },
      { value: 'FLAT', unit: '', label: 'Cornering' },
    ],
  },
  {
    index: 3,
    tag: '04 — TRACK DECELERATION',
    title: 'BREMBO™ 6-PISTON',
    subtitle: '394mm Cross-Drilled Rotors',
    accent: '#FFB800',
    metrics: [
      { value: '394', unit: 'mm', label: 'Front Rotor' },
      { value: '6', unit: 'PISTON', label: 'Calipers' },
      { value: 'ZERO', unit: 'FADE', label: 'Thermal' },
    ],
  },
  {
    index: 4,
    tag: '05 — AERO BALANCE',
    title: 'FUNCTIONAL AERO',
    subtitle: 'Carbon Splitter & Extractor',
    accent: '#ff0000',
    metrics: [
      { value: 'CF', unit: '', label: 'Composite' },
      { value: 'HOOD', unit: 'VENT', label: 'Extractor' },
      { value: 'Cd', unit: '', label: 'Optimised' },
    ],
  },
]

function SpecOverlay({ card, scrollYProgress, index, total }) {
  const step = 1 / total
  const start = index * step
  const end = start + step
  
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.05, end - 0.05, end],
    [0, 1, 1, 0]
  )
  
  const y = useTransform(
    scrollYProgress,
    [start, end],
    [20, -20]
  )

  // Diagonal framing to keep the absolute center completely clear on ALL screens
  // Even index: Top-Left Heading, Bottom-Right Metrics
  // Odd index: Top-Right Heading, Bottom-Left Metrics
  const isEven = index % 2 === 0

  return (
    <motion.div
      style={{ opacity, y, pointerEvents: opacity.get() > 0 ? 'auto' : 'none' }}
      className="absolute inset-0 pt-10 pb-10 px-8 md:pt-12 md:pb-12 md:px-12 z-20 pointer-events-none flex flex-col justify-between"
    >
      {/* TOP SECTION: Heading */}
      <div className={`flex flex-col ${isEven ? 'items-start text-left' : 'items-end text-right'}`}>
        <div className={`flex items-center gap-3 mb-4 md:mb-6 ${!isEven && 'flex-row-reverse'}`}>
          <div className="w-8 h-px md:w-16" style={{ background: card.accent }} />
          <span className="font-mono-tech text-[10px] md:text-xs tracking-[0.4em] uppercase drop-shadow-md bg-black/50 px-2 py-1 backdrop-blur-sm"
            style={{ color: card.accent }}>
            {card.tag}
          </span>
        </div>

        <h3 className="font-racing text-5xl sm:text-7xl lg:text-8xl text-white leading-none drop-shadow-2xl uppercase">
          {card.title}
        </h3>
      </div>

      {/* BOTTOM SECTION: Subtitle & Metrics */}
      <div className={`flex flex-col ${isEven ? 'items-end text-right' : 'items-start text-left'}`}>
        <p className="font-mono-tech text-xs sm:text-base lg:text-lg text-neutral-300 tracking-widest mb-6 md:mb-10 bg-black/40 inline-block px-3 py-1 backdrop-blur-md">
          {card.subtitle}
        </p>

        <div className={`flex flex-row gap-4 md:gap-12 w-full md:w-auto ${isEven ? 'justify-end' : 'justify-start'}`}>
          {card.metrics.map((m, i) => (
            <div key={i} className={`flex-1 md:flex-none py-1 md:py-2 bg-black/40 backdrop-blur-sm ${isEven ? 'border-r-2 pr-3 md:pr-6' : 'border-l-2 pl-3 md:pl-6'}`} style={{ borderColor: card.accent }}>
              <div className="font-racing text-xl sm:text-3xl lg:text-5xl text-white leading-none drop-shadow-sm">
                {m.value}
                {m.unit && <span className="text-[10px] sm:text-sm lg:text-base ml-1" style={{ color: card.accent }}>{m.unit}</span>}
              </div>
              <div className="font-mono-tech text-[8px] sm:text-[9px] lg:text-xs text-neutral-400 tracking-widest uppercase mt-1">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function SpecsSection({ accentColor }) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Map scroll progress (0-1) to an active part index (0-4)
  const rawActiveIndex = useTransform(scrollYProgress, [0, 1], [0, 4.99])
  
  // Apply a spring physics layer to smooth out any micro-stutters during scrolling
  const activeIndex = useSpring(rawActiveIndex, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Smoothly interpolate the global HUD accent color based on the current spec
  // We use the same breakpoints as the text fade-ins (0.0, 1.0, 2.0, etc.)
  // The colors are slightly transparent (0.5 opacity) to match the HUD styling
  const currentColor = useTransform(
    rawActiveIndex,
    [0, 0.8, 1.0, 1.8, 2.0, 2.8, 3.0, 3.8, 4.0],
    [
      'rgba(255,0,0,0.5)',   // 0: Engine
      'rgba(255,0,0,0.5)', 
      'rgba(0,85,255,0.5)',  // 1: Drivetrain
      'rgba(0,85,255,0.5)', 
      'rgba(0,212,170,0.5)', // 2: Suspension
      'rgba(0,212,170,0.5)', 
      'rgba(255,184,0,0.5)', // 3: Brakes
      'rgba(255,184,0,0.5)', 
      'rgba(255,0,0,0.5)',   // 4: Aero
    ]
  )

  useMotionValueEvent(currentColor, "change", (latest) => {
    if (accentColor) accentColor.set(latest)
  })

  return (
    <section ref={containerRef} id="specs" className="relative h-[1000vh] bg-black z-10">
      
      {/* Sticky Full-Screen Viewport */}
      <div className="sticky top-0 h-dvh w-full overflow-hidden flex items-center justify-center">
        
        {/* Background Animation Canvas */}
        <div className="absolute inset-0 z-0">
          <PartAnimationSlot activePartIndexValue={activeIndex} />
        </div>

        {/* HUD Scan Line for transitioning parts */}
        <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-black/80 via-transparent to-black/80" />

        {/* Text Overlays */}
        {SPEC_CARDS.map((card, i) => (
          <SpecOverlay 
            key={i} 
            card={card} 
            index={i} 
            total={SPEC_CARDS.length} 
            scrollYProgress={scrollYProgress} 
          />
        ))}

      </div>
    </section>
  )
}
