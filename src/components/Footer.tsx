import { Globe, Instagram, Facebook, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLenis } from './SmoothScrollProvider'
import { useCallback } from 'react'

const NAV_LINKS = [
  { label: 'HOME', target: '#hero' },
  { label: 'ABOUT', target: '#about' },
  { label: 'INCLUDED', target: '#included' },
  { label: 'CONTACTS', target: '#contact' },
]

export default function Footer() {
  const lenis = useLenis()

  const scrollTo = useCallback((target: string) => {
    if (lenis) {
      lenis.scrollTo(target)
    } else {
      const el = document.querySelector(target)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lenis])

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.9 }}
      transition={{ duration: 0.4 }}
      className="bg-mist-black"
    >
      <div className="h-[1px] bg-white/10" />
      <div className="page-padding py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left — Wordmark */}
          <div className="flex items-center gap-2">
            <Globe className="w-[18px] h-[18px] text-kimono-white" strokeWidth={1.5} />
            <span className="small-caps text-kimono-white">JAPAN TOURS</span>
            <span className="small-caps text-mouse-gray ml-2">&copy; 2025</span>
          </div>

          {/* Center — Nav */}
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.target)}
                className="small-caps text-mouse-gray hover:text-kimono-white transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right — Social */}
          <div className="flex items-center gap-4">
            {[Instagram, Facebook, Send].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-white/40 hover:text-kimono-white transition-colors duration-200"
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
