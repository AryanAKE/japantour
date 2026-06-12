import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { Users, Plane, Bus, Bed } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'

// ─── Cards Configuration ──────────────────────────────────────────────────────
const CARDS = [
  {
    icon: Users,
    title: 'GUIDES',
    tag: 'EXPERIENCE',
    number: '01',
    description: '2 awesome guides who know everything about Japan!',
  },
  {
    icon: Plane,
    title: 'FLIGHTS',
    tag: 'LOGISTICS',
    number: '02',
    description: 'Comfortable routes to Osaka and back from Tokyo.',
  },
  {
    icon: Bus,
    title: 'TRANSFERS',
    tag: 'COMFORT',
    number: '03',
    description: 'Seamless airport pickups and private transfers.',
  },
  {
    icon: Bed,
    title: 'HOTELS',
    tag: 'STAY',
    number: '04',
    description: 'Selected premium hotels, double occupancy with daily breakfast.',
  },
]

// ─── Single 3D Flying Card ────────────────────────────────────────────────────
interface FlyingCardProps {
  card: typeof CARDS[0]
  index: number
  scrollYProgress: MotionValue<number>
  isMobile: boolean
  cardWidth: number
  cardHeight: number
  settleX: number
  settleY: number
}

function FlyingCard({
  card,
  index,
  scrollYProgress,
  isMobile,
  cardWidth,
  cardHeight,
  settleX,
  settleY,
}: FlyingCardProps) {
  const Icon = card.icon

  // Target settle coordinates
  const targetX = isMobile ? 0 : index % 2 === 0 ? -settleX : settleX
  const targetY = isMobile
    ? -180 + index * 120 // Stack vertically on mobile
    : index < 2
    ? -settleY
    : settleY

  // Individual 3D curves for each card
  // Start offsets, mid offsets, and settle coordinates
  let startX = 0
  let midX = 0
  let startY = 0
  let midY = 0
  let startZ = 0
  let midZ = 0
  let startRotX = 0
  let midRotX = 0
  let startRotY = 0
  let midRotY = 0
  let startRotZ = 0
  let midRotZ = 0

  if (index === 0) {
    startX = isMobile ? -200 : -500
    midX = isMobile ? -100 : -350
    startY = isMobile ? -300 : 250
    midY = isMobile ? -250 : 100
    startZ = 500
    midZ = 200
    startRotX = 45
    midRotX = 25
    startRotY = -60
    midRotY = -30
    startRotZ = 30
    midRotZ = 15
  } else if (index === 1) {
    startX = isMobile ? 200 : 500
    midX = isMobile ? 100 : 350
    startY = isMobile ? -200 : -250
    midY = isMobile ? -120 : -100
    startZ = -600
    midZ = -300
    startRotX = -45
    midRotX = -20
    startRotY = 60
    midRotY = 30
    startRotZ = -30
    midRotZ = -15
  } else if (index === 2) {
    startX = isMobile ? -200 : -450
    midX = isMobile ? -80 : -280
    startY = isMobile ? 200 : -350
    midY = isMobile ? 120 : -150
    startZ = -400
    midZ = -150
    startRotX = -30
    midRotX = -15
    startRotY = -45
    midRotY = -20
    startRotZ = 45
    midRotZ = 20
  } else {
    startX = isMobile ? 200 : 450
    midX = isMobile ? 80 : 280
    startY = isMobile ? 300 : 350
    midY = isMobile ? 250 : 150
    startZ = 700
    midZ = 350
    startRotX = 60
    midRotX = 30
    startRotY = 90
    midRotY = 45
    startRotZ = -45
    midRotZ = -20
  }

  // Curves mapped to scroll progress
  const x = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [startX, midX, targetX, targetX])
  const y = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [startY, midY, targetY, targetY])
  const z = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [startZ, midZ, 0, 0])
  const rotateX = useTransform(scrollYProgress, [0, 0.45, 0.75, 1], [startRotX, midRotX, 0, 0])
  const rotateY = useTransform(scrollYProgress, [0, 0.45, 0.75, 1], [startRotY, midRotY, 0, 0])
  const rotateZ = useTransform(scrollYProgress, [0, 0.45, 0.75, 1], [startRotZ, midRotZ, 0, 0])

  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.75, 1], [0, 1, 1, 1])

  // Depth of field blur effect
  const blurVal = useTransform(scrollYProgress, [0, 0.25, 0.65, 0.75], [16, 6, 2, 0])
  const filter = useTransform(blurVal, (v) => (v > 0.1 ? `blur(${v}px)` : 'none'))

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -cardWidth / 2,
        marginTop: -cardHeight / 2,
        width: cardWidth,
        height: cardHeight,
        x,
        y,
        z,
        rotateX,
        rotateY,
        rotateZ,
        opacity,
        filter,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{
        scale: 1.03,
        z: 20,
        transition: { duration: 0.3 },
      }}
      className="group bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 lg:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:border-lime-accent/40 transition-colors duration-300 overflow-hidden"
    >
      {/* Decorative inner gradient border line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-lime-accent/30 transition-all duration-300" />

      {/* Dynamic light glow effect following mouse cursor */}
      <div className="absolute -inset-px bg-gradient-to-br from-lime-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

      {isMobile ? (
        // Mobile Layout: Horizontal representation
        <div className="flex gap-4 items-center h-full w-full relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lime-accent shrink-0 group-hover:bg-lime-accent group-hover:text-mist-black transition-all duration-300">
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold tracking-wide text-kimono-white truncate">
                {card.title}
              </h3>
              <span className="text-[8px] font-bold tracking-wider text-lime-accent bg-lime-accent/10 px-1.5 py-0.5 rounded border border-lime-accent/20 uppercase shrink-0">
                {card.tag}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-400 leading-snug font-body line-clamp-2">
              {card.description}
            </p>
          </div>
          <span className="absolute right-0 bottom-1 font-display font-black text-4xl text-white/[0.02] select-none group-hover:text-lime-accent/[0.05] transition-colors duration-500 leading-none shrink-0">
            {card.number}
          </span>
        </div>
      ) : (
        // Desktop Layout: Vertical layout
        <>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lime-accent group-hover:bg-lime-accent group-hover:text-mist-black group-hover:scale-110 transition-all duration-300">
              <Icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-semibold tracking-wider text-lime-accent bg-lime-accent/10 px-2.5 py-1 rounded-full border border-lime-accent/20 uppercase">
              {card.tag}
            </span>
          </div>

          <span className="absolute bottom-6 right-6 font-display font-black text-7xl text-white/[0.02] select-none group-hover:text-lime-accent/[0.05] transition-colors duration-500 leading-none">
            {card.number}
          </span>

          <div className="mt-6 relative z-10">
            <h3 className="font-display text-xl lg:text-2xl font-medium tracking-wide text-kimono-white">
              {card.title}
            </h3>
            <p className="mt-2 text-xs lg:text-sm text-neutral-400 leading-relaxed font-body">
              {card.description}
            </p>
          </div>
        </>
      )}
    </motion.div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function IncludedSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [windowWidth, setWindowWidth] = useState(1200)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)
      const handleResize = () => setWindowWidth(window.innerWidth)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const isMobile = windowWidth < 1024

  // Sticky Scroll hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Visual layout constants
  const cardWidth = isMobile ? 290 : 310
  const cardHeight = isMobile ? 100 : 255
  const settleX = isMobile ? 0 : 170
  const settleY = isMobile ? 0 : 145

  // Header transform: fades down and shifts left slightly to focus cards
  const textOpacity = useTransform(scrollYProgress, [0, 0.7, 0.95], [1, 1, 0.9])
  const textScale = useTransform(scrollYProgress, [0, 0.75], [1, 0.98])

  return (
    <div ref={containerRef} className="relative h-[250vh] bg-mist-black">
      {/* Sticky container covering viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden bg-[#070707]">
        {/* Background Grid Lines & Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,248,122,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="page-padding w-full h-full flex flex-col lg:grid lg:grid-cols-[1fr_1.3fr] items-center relative z-10 py-12 lg:py-0 gap-8 lg:gap-16">
          {/* Left Column: Title & Text info */}
          <motion.div
            style={{
              opacity: textOpacity,
              scale: textScale,
            }}
            className="w-full flex flex-col items-center lg:items-start text-center lg:text-left justify-center relative z-20"
          >
            <SectionHeading text="WHAT'S INCLUDED" align={isMobile ? 'center' : 'left'} />
            
            <p className="mt-6 text-sm lg:text-base leading-relaxed text-neutral-400 max-w-[420px] font-body">
              We have designed a completely seamless premium experience. From curated luxury stays to airport logistics, everything is included in your package. Scroll to witness the elements fall into place.
            </p>

            {/* Scroll progress visualizer */}
            <div className="hidden lg:flex items-center gap-4 mt-10">
              <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                SCROLL PROGRESS
              </span>
              <div className="w-24 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
                <motion.div
                  style={{ scaleX: scrollYProgress }}
                  className="absolute inset-0 bg-lime-accent origin-left"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D perspective viewport */}
          <div
            style={{
              perspective: 1200,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full flex-1 lg:h-[80vh] flex items-center justify-center pointer-events-none"
          >
            {/* The actual solid cards flying */}
            <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
              {CARDS.map((card, i) => (
                <FlyingCard
                  key={card.title}
                  card={card}
                  index={i}
                  scrollYProgress={scrollYProgress}
                  isMobile={isMobile}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  settleX={settleX}
                  settleY={settleY}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
