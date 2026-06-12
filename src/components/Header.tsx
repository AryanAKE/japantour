import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useLenis } from './SmoothScrollProvider'

const NAV_LINKS = [
  { label: 'ABOUT', target: '#about' },
  { label: 'INCLUDED', target: '#included' },
  { label: 'CONTACTS', target: '#contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const lenis = useLenis()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.5)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = useCallback((target: string) => {
    if (lenis) {
      lenis.scrollTo(target)
    } else {
      const el = document.querySelector(target)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lenis])

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-400"
      style={{
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="page-padding flex items-center justify-between h-16 md:h-20">
        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <Globe className="w-[18px] h-[18px] text-kimono-white" strokeWidth={1.5} />
          <span className="small-caps text-kimono-white">JAPAN TOURS</span>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.target)}
              className="small-caps text-kimono-white relative group"
            >
              {link.label}
              <span className="absolute bottom-[-2px] left-0 w-full h-[1px] bg-kimono-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </button>
          ))}
        </nav>

        {/* Book Button */}
        <button
          onClick={() => scrollTo('#contact')}
          className="small-caps text-kimono-white border border-white/30 rounded-full px-6 py-2 relative overflow-hidden group"
        >
          <span
            className="absolute inset-0 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"
            style={{
              backgroundColor: 'rgba(212, 248, 122, 0.15)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          <span className="relative">BOOK</span>
        </button>
      </div>
    </motion.header>
  )
}
