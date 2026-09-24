import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      // Check if hovering over clickable elements
      const target = e.target
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return (
    <>
      {/* Center dot */}
      <motion.div
        className="fixed top-0 left-0 w-1 h-1 bg-[#ff0000] rounded-full pointer-events-none z-[10000]"
        animate={{
          x: mousePosition.x - 2,
          y: mousePosition.y - 2,
          scale: isHovering ? 0 : 1
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />
      
      {/* Outer reticle */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-[#ff0000]/50 rounded-full pointer-events-none z-[10000] flex items-center justify-center"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? 'rgba(255, 0, 0, 1)' : 'rgba(255, 0, 0, 0.3)',
          borderRadius: isHovering ? '0%' : '50%'
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      >
        {isHovering && (
          <div className="absolute w-12 h-12 border border-[#ff0000] rotate-45" />
        )}
      </motion.div>
    </>
  )
}
