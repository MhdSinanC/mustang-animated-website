import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const TELEMETRY_DATA = [
  { label: 'Platform', value: 'S550 Aluminium Intensive' },
  { label: 'Front Track', value: '1,585 mm' },
  { label: 'Rear Track', value: '1,595 mm' },
  { label: 'Wheelbase', value: '2,720 mm' },
  { label: 'Weight Dist.', value: '54% / 46% F/R' },
  { label: 'Active Valve Exhaust', value: 'Quad-exit' },
  { label: 'Mode: Track', value: 'Unrestricted howl' },
  { label: 'Front Tyres', value: '305/30ZR19 Cup 2' },
  { label: 'Rear Tyres', value: '305/30ZR19 Cup 2' },
  { label: 'Wheels', value: '19×10.5" Forged Al' },
  { label: 'Curb Weight', value: '1,752 kg' },
  { label: 'Top Speed', value: '280 km/h' },
  { label: '0–100 km/h', value: '3.9 seconds' },
  { label: '1/4 Mile', value: '12.0s @ 191 km/h' },
  { label: 'Skidpad', value: '1.05g lateral' },
]

export default function DataGrid() {
  const [glitchTrigger, setGlitchTrigger] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchTrigger(prev => prev + 1)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="data-grid" className="bg-black py-40 relative z-20 overflow-hidden border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-6 relative">
        
        {/* Background purely decorative massive numbers */}
        <div className="absolute top-0 right-0 opacity-[0.02] font-racing text-[30rem] leading-none pointer-events-none text-[#ff0000] rotate-90 origin-right translate-x-1/2">
          526
        </div>

        {/* Section header terminal style */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="font-mono-tech text-[#ff0000] text-sm tracking-[0.5em] mb-2 glitch-effect" data-text="> RUNNING DIAGNOSTICS...">
            {'> RUNNING DIAGNOSTICS...'}
          </div>
          <h2 className="font-mono-tech text-4xl sm:text-6xl text-white uppercase tracking-widest border-l-4 border-[#ff0000] pl-6">
            Raw Telemetry
          </h2>
        </motion.div>

        {/* Grid layout that feels chaotic but structured */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
          {TELEMETRY_DATA.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex flex-col border-b border-neutral-800 pb-2 hover:border-[#ff0000]/50 transition-colors"
            >
              <span className="font-mono-tech text-[10px] text-[#ff0000] tracking-[0.4em] mb-1">
                // 0{i.toString(16).toUpperCase()}
              </span>
              <div className="flex justify-between items-end">
                <span className="font-mono-tech text-xs text-neutral-500 uppercase tracking-widest">
                  {item.label}
                </span>
                <span className={`font-mono-tech text-sm text-white tracking-widest ${glitchTrigger % (i+2) === 0 ? 'glitch-effect' : ''}`} data-text={item.value}>
                  {item.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Terminal footer */}
        <div className="mt-32 border border-[#ff0000]/30 p-6 bg-[#ff0000]/5 max-w-2xl">
          <div className="font-mono-tech text-[#ff0000] text-sm tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ff0000] animate-pulse-red" />
            END OF FILE
          </div>
          <p className="font-mono-tech text-xs text-neutral-400 leading-relaxed uppercase">
            Data sourced from internal Shelby American Inc. testing. Conditions nominal. Driver input required for final verification.
          </p>
        </div>

      </div>
    </section>
  )
}
