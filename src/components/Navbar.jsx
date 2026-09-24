import { useState, useEffect, useRef } from 'react'

const NAV_LINKS = [
  { label: 'Overview', href: '#hero' },
  { label: 'Powertrain', href: '#specs' },
  { label: 'Aero & Chassis', href: '#specs' },
  { label: 'Interior', href: '#data-grid' },
  { label: 'Specs', href: '#data-grid' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500
        ${scrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-neutral-900 shadow-[0_1px_30px_rgba(230,0,0,0.1)]' 
          : 'bg-transparent border-b border-transparent'}`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="w-8 h-8 relative">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Cobra snake silhouette */}
              <path
                d="M24 4C14 4 6 10 6 18C6 24 10 28 16 30C10 32 6 36 6 40C6 42 7 44 8 44C12 44 16 40 20 36C21 38 22 40 24 40C26 40 27 38 28 36C32 40 36 44 40 44C41 44 42 42 42 40C42 36 38 32 32 30C38 28 42 24 42 18C42 10 34 4 24 4Z"
                fill="#E60000"
                className="transition-all duration-300 group-hover:fill-red-400"
              />
              <circle cx="19" cy="16" r="2" fill="white" />
              <circle cx="29" cy="16" r="2" fill="white" />
              <path d="M20 22C21.5 24 26.5 24 28 22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-racing text-white text-sm tracking-[0.15em] uppercase font-bold">Shelby</span>
            <span className="font-mono-tech text-[#E60000] text-[9px] tracking-[0.3em] uppercase">GT350</span>
          </div>
        </a>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              <a
                href={link.href}
                className="font-mono-tech text-xs tracking-[0.2em] text-neutral-400 uppercase
                  hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#E60000] group-hover:w-full transition-all duration-300" />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            className="font-mono-tech text-xs tracking-[0.2em] uppercase px-5 py-2.5
              border border-[#E60000] text-[#E60000]
              hover:bg-[#E60000] hover:text-white
              transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Configure / Inquire</span>
            <span className="absolute inset-0 bg-[#E60000] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
            <span className="absolute inset-0 bg-[#E60000] translate-x-[101%] group-hover:translate-x-0 transition-transform duration-300" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
          <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-400 ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#0D0F12] border-t border-neutral-800 px-6 py-4 space-y-4">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block font-mono-tech text-xs tracking-[0.2em] text-neutral-400 uppercase hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button className="w-full font-mono-tech text-xs tracking-[0.2em] uppercase px-5 py-2.5 border border-[#E60000] text-[#E60000] mt-2">
            Configure / Inquire
          </button>
        </div>
      </div>
    </header>
  )
}
