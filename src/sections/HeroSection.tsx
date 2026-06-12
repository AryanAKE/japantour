import { useRef, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Instagram, Facebook, Send } from 'lucide-react'
import { useLenis } from '../components/SmoothScrollProvider'

const POLAROIDS = [
  { src: '/assets/polaroid-pagoda.mp4', caption: '3 CITIES IN JAPAN' },
  { src: '/assets/polaroid-rice-terraces.mp4', caption: '10 DAYS' },
  { src: '/assets/polaroid-torii.mp4', caption: 'GIGABYTES OF PHOTOS' },
  { src: '/assets/polaroid-ramen.mp4', caption: 'EAT RAMEN' },
  { src: '/assets/polaroid-neon.mp4', caption: 'ENJOY THE VIBE' },
]

const STANDARD_EASE = [0.16, 1, 0.3, 1] as const

function PolaroidCard({ src, caption, index }: { src: string; caption: string; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => {
    videoRef.current?.play()
  }
  const handleMouseLeave = () => {
    videoRef.current?.pause()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.8 + index * 0.15,
        duration: 0.6,
        ease: STANDARD_EASE,
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(255, 184, 197, 0.2)',
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor="pointer"
      className="shrink-0 w-[160px] rounded-lg overflow-hidden"
      style={{
        background: 'rgba(20, 20, 20, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '8px 8px 32px 8px',
        transition: 'box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="w-full h-[140px] rounded overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <span className="block mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-mouse-gray">
        {caption}
      </span>
    </motion.div>
  )
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  // Section-scoped scroll tracking for parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Parallax transforms: mountains slowest (0.3x), text mid (0.5x), polaroids lateral (0.4x)
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 300])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 500])
  const stripX = useTransform(scrollYProgress, [0, 1], [0, -400])

  const scrollToContact = useCallback(() => {
    if (lenis) {
      lenis.scrollTo('#contact')
    } else {
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lenis])

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-mist-black"
    >
      {/* ===== LAYER 0: Sky Background (full mountain image, lowest z) ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: STANDARD_EASE }}
        style={{ y: bgY, willChange: 'transform' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/assets/hero-mountains.jpg"
          alt="Misty Japanese mountains at dawn"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
      </motion.div>

      {/* ===== LAYER 1: "JAPAN" Typography (behind mountains, above sky) ===== */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 0.9, y: 0 }}
        transition={{ delay: 0.3, duration: 1, ease: STANDARD_EASE }}
        style={{ y: textY, willChange: 'transform' }}
        className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none"
      >
        <h1
          className="font-display font-light uppercase text-kimono-white select-none"
          style={{
            fontSize: 'clamp(80px, 15vw, 220px)',
            lineHeight: 0.9,
            letterSpacing: '0.02em',
            marginTop: '-24vh',
          }}
        >
          JAPAN
        </h1>
      </motion.div>

      {/* ===== LAYER 2: Mountain Foreground (masked — transparent sky, opaque mountains) ===== */}
      {/* This is the same mountain image again, but with a CSS mask that removes the sky,
          letting the JAPAN text peek through above the ridgeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: STANDARD_EASE }}
        style={{ y: bgY, willChange: 'transform' }}
        className="absolute inset-0 z-10 pointer-events-none"
      >
        <img
          src="/assets/hero-mountains.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'center 30%',
            maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 28%, rgba(0,0,0,0.4) 36%, black 45%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 28%, rgba(0,0,0,0.4) 36%, black 45%, black 100%)',
          }}
        />
        {/* Bottom gradient to blend into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[30%]"
          style={{
            background: 'linear-gradient(to bottom, transparent, #0A0A0A)',
          }}
        />
      </motion.div>

      {/* ===== LAYER 3: Foreground — Kimono Figure, Nav elements, Polaroids, Book button ===== */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Kimono Figure — no parallax transform, acts as visual anchor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: STANDARD_EASE }}
          className="absolute pointer-events-auto"
          style={{
            right: '6vw',
            top: '50%',
            transform: 'translateY(-55%)',
            width: 'clamp(200px, 22vw, 360px)',
          }}
        >
          <img
            src="/assets/hero-kimono-figure.png"
            alt="Woman in floral kimono gazing at the valley"
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {/* Hero Book Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, ease: STANDARD_EASE }}
          onClick={scrollToContact}
          className="absolute pointer-events-auto rounded-full font-medium uppercase tracking-[0.1em] text-mist-black overflow-hidden group"
          style={{
            right: '20vw',
            bottom: '15vh',
            padding: '20px 56px',
            fontSize: '16px',
            fontFamily: "'Inter', sans-serif",
            background: 'rgba(245, 232, 211, 0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <span
            className="absolute inset-0 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-400"
            style={{
              background: 'linear-gradient(to top, rgba(212, 248, 122, 0.3), rgba(245, 232, 211, 0.9))',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          <span className="relative">BOOK</span>
        </motion.button>

        {/* Polaroid Card Strip — parallax translateX */}
        <motion.div
          style={{ x: stripX, left: 'clamp(24px, 5vw, 80px)', bottom: '10vh', willChange: 'transform' }}
          className="absolute pointer-events-auto"
        >
          <div className="flex gap-4">
            {POLAROIDS.map((p, i) => (
              <PolaroidCard key={i} {...p} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Vertical Social Icons (hero only) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6, ease: STANDARD_EASE }}
          className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-5 pointer-events-auto"
        >
          {[Instagram, Facebook, Send].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="text-white/40 hover:text-kimono-white transition-colors duration-200"
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
