import { useEffect, useRef, useState } from 'react'

function SoundButton() {
  const [playing, setPlaying] = useState(false)
  const [wavePhase, setWavePhase] = useState(0)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setWavePhase(p => (p + 1) % 20), 80)
    return () => clearInterval(id)
  }, [playing])

  return (
    <button
      onClick={() => setPlaying(!playing)}
      className="group flex items-center gap-4 border border-neutral-700 hover:border-[#E60000]/60
        bg-[#16191E] hover:bg-[#E60000]/5 transition-all duration-300 px-6 py-4 relative overflow-hidden"
      aria-label={playing ? 'Stop V8 sound' : 'Play V8 sound'}
    >
      {/* Sound wave bars */}
      <div className="flex items-center gap-0.5 h-8">
        {[3, 6, 9, 12, 8, 14, 10, 7, 11, 5, 9, 6, 13, 8, 4].map((base, i) => {
          const h = playing
            ? Math.max(4, base + Math.sin((wavePhase + i) * 0.7) * 6)
            : [2, 4, 8, 12, 8, 4, 2][i % 7]
          return (
            <div
              key={i}
              className="w-0.5 rounded-full transition-all duration-75"
              style={{
                height: `${h}px`,
                backgroundColor: playing ? '#E60000' : 'rgba(255,255,255,0.2)',
              }}
            />
          )
        })}
      </div>

      <div className="text-left">
        <div className="font-mono-tech text-[10px] tracking-[0.3em] uppercase text-neutral-400 group-hover:text-white transition-colors">
          {playing ? 'VOODOO HOWLING...' : 'HEAR THE VOODOO V8'}
        </div>
        <div className="font-mono-tech text-[8px] tracking-widest text-neutral-700 mt-0.5">
          {playing ? '8,250 RPM · ACTIVE' : 'CLICK TO IGNITE · 5.2L FLAT-PLANE'}
        </div>
      </div>

      {/* Play / Stop icon */}
      <div className="w-8 h-8 border border-neutral-700 group-hover:border-[#E60000] flex items-center justify-center transition-colors duration-300">
        {playing ? (
          <span className="text-[#E60000] text-xs font-bold">■</span>
        ) : (
          <span className="text-neutral-400 group-hover:text-[#E60000] text-xs transition-colors">▶</span>
        )}
      </div>

      {/* INSERT ASSET HERE: Audio file / Web Audio API engine sample */}
      {/* Uncomment and connect to an actual audio source:
      <audio ref={audioRef} src="/sounds/voodoo-v8.mp3" loop />
      */}

      <div className="absolute inset-0 bg-[#E60000]/0 group-hover:bg-[#E60000]/3 transition-colors duration-300" />
    </button>
  )
}

export default function Footer() {
  const [ref, setRef] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref)
    return () => obs.disconnect()
  }, [ref])

  return (
    <footer className="relative bg-black overflow-hidden">

      {/* CTA Banner */}
      <div
        ref={setRef}
        className="relative border-t border-neutral-900 py-32 px-6 overflow-hidden"
      >
        {/* Ambient red back-glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-64
          bg-radial-[ellipse_at_bottom] from-[#E60000]/20 via-[#E60000]/5 to-transparent
          pointer-events-none" />

        {/* Corner decor lines */}
        <div className="absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-[#E60000]/60 to-transparent" />
        <div className="absolute top-0 left-0 h-24 w-px bg-gradient-to-b from-[#E60000]/60 to-transparent" />
        <div className="absolute top-0 right-0 w-24 h-px bg-gradient-to-l from-[#E60000]/60 to-transparent" />
        <div className="absolute top-0 right-0 h-24 w-px bg-gradient-to-b from-[#E60000]/60 to-transparent" />

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 mb-8 transition-all duration-700 delay-100
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="w-1.5 h-1.5 bg-[#E60000] rounded-full animate-pulse-red" />
            <span className="font-mono-tech text-[9px] tracking-[0.4em] uppercase text-[#E60000]">
              SHELBY AMERICAN · GT350 · ORDER DESK OPEN
            </span>
            <div className="w-1.5 h-1.5 bg-[#E60000] rounded-full animate-pulse-red" />
          </div>

          {/* Main headline */}
          <h2 className={`font-racing text-5xl sm:text-7xl lg:text-8xl text-white leading-none mb-6
            transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            READY TO<br />
            <span className="text-gradient-red">DOMINATE</span>
          </h2>

          <p className={`font-mono-tech text-sm text-neutral-500 tracking-wide max-w-xl mx-auto mb-12
            transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            One car. One engine. One obsession. Configure your Shelby GT350 or connect with a specialist to begin your build.
          </p>

          {/* Sound button */}
          <div className={`flex justify-center mb-10 transition-all duration-700 delay-400
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <SoundButton />
          </div>

          {/* CTA buttons */}
          <div className={`flex flex-col sm:flex-row justify-center gap-4 transition-all duration-700 delay-500
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button className="relative group font-mono-tech text-sm tracking-[0.25em] uppercase
              px-10 py-4 bg-[#E60000] text-white overflow-hidden
              hover:shadow-[0_0_40px_rgba(230,0,0,0.5)] transition-all duration-300">
              <span className="relative z-10">Configure Now</span>
              <div className="absolute inset-0 bg-red-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <button className="group font-mono-tech text-sm tracking-[0.25em] uppercase
              px-10 py-4 border border-neutral-600 text-neutral-400
              hover:border-white hover:text-white transition-all duration-300">
              Dealer Inquiry
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-900 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-px bg-[#E60000]/50" />
            <span className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-neutral-700">
              © 2024 Ford Motor Company · Shelby American Inc.
            </span>
          </div>
          <div className="flex items-center gap-6">
            {['Privacy', 'Legal', 'Contact', 'Media'].map(link => (
              <a
                key={link}
                href="#"
                className="font-mono-tech text-[9px] tracking-[0.25em] uppercase text-neutral-700
                  hover:text-neutral-400 transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
