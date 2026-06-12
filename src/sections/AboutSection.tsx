import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import SectionHeading from '../components/SectionHeading'

const STANDARD_EASE = [0.16, 1, 0.3, 1] as const

interface TimelineNodeProps {
  label: string
  photos: { src: string; alt: string; rotate: string }[]
  index: number
}

function PhotoCluster({ photos, scrollProgress }: {
  photos: { src: string; alt: string; rotate: string }[]
  scrollProgress: import('framer-motion').MotionValue<number>
}) {
  // Each photo in the cluster has its own scroll-driven parallax offset,
  // creating a subtle depth separation between stacked photos
  const photo0Y = useTransform(scrollProgress, [0, 0.5, 1], [30, 0, -15])
  const photo1Y = useTransform(scrollProgress, [0, 0.5, 1], [50, 0, -25])
  const photo0Rotate = useTransform(scrollProgress, [0, 0.5, 1], [8, parseFloat(photos[0]?.rotate) || 3, parseFloat(photos[0]?.rotate) - 2 || 1])
  const photo1Rotate = useTransform(scrollProgress, [0, 0.5, 1], [-8, parseFloat(photos[1]?.rotate) || -2, parseFloat(photos[1]?.rotate) + 2 || 0])

  return (
    <motion.div
      className="relative flex group cursor-pointer"
      data-cursor="pointer"
      style={{ width: 260, height: 180 }}
      whileHover="hover"
    >
      {photos.map((photo, i) => (
        <motion.img
          key={i}
          src={photo.src}
          alt={photo.alt}
          variants={{
            hover: {
              rotate: i === 0 ? -5 : 5,
              x: i === 0 ? -14 : 14,
              scale: 1.04,
              transition: { duration: 0.4, ease: STANDARD_EASE },
            },
          }}
          className="absolute object-cover rounded-sm"
          style={{
            width: 175,
            height: 130,
            top: i === 0 ? 0 : 20,
            left: i === 0 ? 0 : 60,
            y: i === 0 ? photo0Y : photo1Y,
            rotate: i === 0 ? photo0Rotate : photo1Rotate,
            border: '3px solid white',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            willChange: 'transform',
          }}
          loading="lazy"
        />
      ))}
    </motion.div>
  )
}

function TimelineNode({ label, photos, index }: TimelineNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(nodeRef, { once: true, amount: 0.3 })

  // Scroll-linked transforms scoped to this node's position in the viewport.
  // As the node scrolls from bottom to top, these create a smooth floating effect.
  const { scrollYProgress } = useScroll({
    target: nodeRef,
    offset: ['start end', 'end start'],
  })

  // Subtle parallax: the card content floats upward slightly faster than its container
  const contentY = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -20])
  // Gentle scale breathe — cards feel like they expand into focus
  const cardScale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.92, 1, 1, 0.97])
  // Slight opacity fade at edges to create depth-of-field illusion
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.6])

  // Alternating horizontal drift: odd cities slide from left, even from right
  const driftDirection = index % 2 === 0 ? 1 : -1
  const contentX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [20 * driftDirection, 0, 0, -10 * driftDirection])

  return (
    <motion.div
      ref={nodeRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: STANDARD_EASE,
      }}
      className="relative flex items-start gap-8"
      style={{ willChange: 'transform' }}
    >
      {/* Dot — pulses into existence */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{
          delay: index * 0.2 + 0.2,
          duration: 0.3,
          ease: STANDARD_EASE,
        }}
        className="shrink-0 w-[10px] h-[10px] rounded-full bg-lime-accent mt-2"
      />

      {/* Content wrapper — scroll-driven transforms applied here */}
      <motion.div
        className="flex flex-col gap-5"
        style={{
          y: contentY,
          x: contentX,
          scale: cardScale,
          opacity: scrollOpacity,
          willChange: 'transform, opacity',
        }}
      >
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{
            delay: index * 0.2 + 0.3,
            duration: 0.5,
            ease: STANDARD_EASE,
          }}
          className="text-[12px] font-medium uppercase tracking-[0.14em] text-kimono-white"
        >
          {label}
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{
            delay: index * 0.2 + 0.4,
            duration: 0.7,
            ease: STANDARD_EASE,
          }}
        >
          <PhotoCluster photos={photos} scrollProgress={scrollYProgress} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.8 })

  const parts = text.split(highlight)

  return (
    <span ref={ref}>
      {parts[0]}
      <motion.span
        animate={isInView ? { color: '#D4F87A' } : { color: '#FAFAFA' }}
        transition={{ duration: 0.6, ease: STANDARD_EASE }}
        style={{ color: '#FAFAFA' }}
      >
        {highlight}
      </motion.span>
      {parts[1]}
    </span>
  )
}

const TIMELINE_DATA = [
  {
    label: 'DAYS 1–3 — OSAKA',
    photos: [
      { src: '/assets/timeline-osaka-castle.jpg', alt: 'Osaka Castle', rotate: '3deg' },
      { src: '/assets/timeline-osaka-skyline.jpg', alt: 'Osaka skyline', rotate: '-2deg' },
    ],
  },
  {
    label: 'DAYS 4–6 — KYOTO',
    photos: [
      { src: '/assets/timeline-kyoto-pagoda.jpg', alt: 'Kyoto pagoda', rotate: '-3deg' },
      { src: '/assets/timeline-kyoto-torii.jpg', alt: 'Fushimi Inari', rotate: '2deg' },
    ],
  },
  {
    label: 'DAYS 7–10 — TOKYO',
    photos: [
      { src: '/assets/timeline-tokyo-shibuya.jpg', alt: 'Shibuya crossing', rotate: '2deg' },
      { src: '/assets/timeline-tokyo-street.jpg', alt: 'Tokyo street', rotate: '-3deg' },
    ],
  },
]

export default function AboutSection() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const isTimelineInView = useInView(timelineRef, { once: true, amount: 0.15 })

  return (
    <section id="about" className="bg-mist-black section-padding">
      <div className="page-padding">
        <SectionHeading text="ABOUT THE TOUR" align="center" />

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-16 lg:gap-24">
          {/* Left Column — Editorial Text */}
          <div className="flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: STANDARD_EASE }}
              className="text-kimono-white text-base leading-relaxed max-w-[480px]"
            >
              <HighlightText
                text="We've planned a simple and convenient 10-day itinerary for your trip to Japan. You'll visit three cities: Osaka, Kyoto, and Tokyo."
                highlight="Osaka, Kyoto, and Tokyo"
              />
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.2, ease: STANDARD_EASE }}
              className="text-kimono-white text-base leading-relaxed max-w-[480px] mt-16"
            >
              <HighlightText
                text="No need to worry about routes, schedules, or finding places — everything is already organized. We'll show you where to go, what to see, and where to eat, so you can simply enjoy the journey."
                highlight="enjoy the journey"
              />
            </motion.p>
          </div>

          {/* Right Column — Timeline */}
          <div ref={timelineRef} className="relative flex flex-col gap-20 pl-4">
            {/* Vertical Line */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isTimelineInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 0.8, ease: STANDARD_EASE }}
              className="absolute left-[1px] top-0 bottom-0 w-[1px] bg-white/15 origin-top"
            />

            {TIMELINE_DATA.map((node, i) => (
              <TimelineNode
                key={i}
                label={node.label}
                photos={node.photos}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
