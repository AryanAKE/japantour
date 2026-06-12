import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Hide on mobile / touch devices
    if (window.innerWidth < 768) return

    // Respect prefers-reduced-motion — use simpler cursor with no lerp
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    setIsVisible(true)

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
      // If reduced motion, snap immediately
      if (prefersReduced && cursorRef.current) {
        pos.current = { x: e.clientX, y: e.clientY }
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      }
    }

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a, button, [role="button"], input, textarea, [data-cursor="pointer"]')
      setIsHovering(!!el)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)

    let raf: number
    if (!prefersReduced) {
      const animate = () => {
        pos.current.x += (target.current.x - pos.current.x) * 0.15
        pos.current.y += (target.current.y - pos.current.y) * 0.15
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
        }
        raf = requestAnimationFrame(animate)
      }
      raf = requestAnimationFrame(animate)
    }

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      if (!prefersReduced) cancelAnimationFrame(raf)
    }
  }, [])

  // Don't render anything on mobile
  if (!isVisible) return null

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ willChange: 'transform' }}
    >
      <motion.div
        animate={{
          width: isHovering ? 32 : 8,
          height: isHovering ? 32 : 8,
          backgroundColor: isHovering ? 'transparent' : '#FAFAFA',
          borderWidth: isHovering ? 1 : 0,
          borderColor: '#FAFAFA',
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-full"
        style={{
          mixBlendMode: 'difference',
          borderStyle: 'solid',
        }}
      />
    </div>
  )
}
