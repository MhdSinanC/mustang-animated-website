import { useEffect } from 'react'
import { useMotionValue } from 'framer-motion'
import Lenis from 'lenis'
import HUDOverlay from './components/HUDOverlay'
import CustomCursor from './components/CustomCursor'
import HeroSection from './components/HeroSection'
import SpecsSection from './components/SpecsSection'
import DataGrid from './components/DataGrid'

export default function App() {
  const accentColor = useMotionValue('rgba(255, 0, 0, 0.5)')

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <CustomCursor />

      <HUDOverlay accentColor={accentColor} />
      
      <div className="bg-black text-white selection:bg-[#ff0000] selection:text-white">
        <main>
          <HeroSection />
          <SpecsSection accentColor={accentColor} />
          <DataGrid />
        </main>
      </div>
    </>
  )
}
