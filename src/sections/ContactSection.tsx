import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'framer-motion'

const STANDARD_EASE = [0.16, 1, 0.3, 1] as const

// ─── Wind-Blown Sakura Petal System ───────────────────────────────────────────
// Physics: Each petal follows a two-phase trajectory:
//   Phase 1 (LINEAR): Blows in a mostly-horizontal direction with gentle wobble,
//           mimicking a steady wind gust carrying the petal across the screen.
//   Phase 2 (SPIRAL): The wind "catches" the petal into a spiraling vortex,
//           simulating eddies and turbulence — radius tightens over time.
// The section is FILLED with 120 petals at multiple depth layers.

interface Petal {
  id: number
  startX: number  // 0-1 normalized entry X
  startY: number  // 0-1 normalized entry Y
  linearAngle: number // radians
  linearSpeed: number // px per unit progress
  spiralCenterOffsetX: number
  spiralCenterOffsetY: number
  spiralRadius: number
  spiralSpeed: number
  spiralDecay: number
  size: number
  rotationSpeed: number
  opacity: number
  phaseStart: number
  phaseEnd: number
  spiralOnset: number // when spiral begins (0-1 of local progress)
  depth: number
  hue: number
  petalType: number // 0-2 for different petal shapes
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generatePetals(count: number): Petal[] {
  const rand = seededRandom(42)
  const petals: Petal[] = []

  for (let i = 0; i < count; i++) {
    const depth = 0.3 + rand() * 0.7
    const phaseStart = rand() * 0.55
    const duration = 0.35 + rand() * 0.45
    const phaseEnd = Math.min(phaseStart + duration, 1.0)

    // Distribute start positions across ALL edges, not just left
    let startX: number, startY: number, linearAngle: number
    const edgeRoll = rand()
    if (edgeRoll < 0.45) {
      // Left edge (45%)
      startX = -0.08 + rand() * 0.1
      startY = rand()
      linearAngle = -0.4 + rand() * 0.8 // mostly rightward
    } else if (edgeRoll < 0.7) {
      // Top edge (25%)
      startX = rand()
      startY = -0.08 + rand() * 0.1
      linearAngle = 0.8 + rand() * 0.8 // downward-right
    } else if (edgeRoll < 0.85) {
      // Right edge (15%)
      startX = 1.0 + rand() * 0.08
      startY = rand()
      linearAngle = Math.PI - 0.5 + rand() * 1.0 // leftward
    } else {
      // Scattered from within the viewport (15%)
      startX = rand() * 0.8 + 0.1
      startY = rand() * 0.8 + 0.1
      linearAngle = -0.6 + rand() * 1.2
    }

    petals.push({
      id: i,
      startX,
      startY,
      linearAngle,
      linearSpeed: 400 + rand() * 900,
      spiralCenterOffsetX: -40 + rand() * 80,
      spiralCenterOffsetY: -40 + rand() * 80,
      spiralRadius: 40 + rand() * 120,
      spiralSpeed: 2 + rand() * 5,
      spiralDecay: 0.2 + rand() * 0.5,
      size: (14 + rand() * 22) * (0.5 + depth * 0.5), // 14-36px base, scaled by depth
      rotationSpeed: (rand() > 0.5 ? 1 : -1) * (180 + rand() * 720),
      opacity: 0.35 + depth * 0.55,
      phaseStart,
      phaseEnd,
      spiralOnset: 0.3 + rand() * 0.3,
      depth,
      hue: -15 + rand() * 30,
      petalType: Math.floor(rand() * 3),
    })
  }

  return petals
}

const PETAL_COUNT = 120
const ALL_PETALS = generatePetals(PETAL_COUNT)

// ─── Canvas Petal Renderer ────────────────────────────────────────────────────

function SakuraCanvas({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const rafRef = useRef<number>()
  const dimensionsRef = useRef({ w: 0, h: 0 })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progressRef.current = v
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateSize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      dimensionsRef.current = { w: rect.width, h: rect.height }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Draw a single sakura petal with realistic shape
  const drawPetal = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      hue: number,
      petalType: number,
      dpr: number
    ) => {
      ctx.save()
      ctx.translate(x * dpr, y * dpr)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(dpr, dpr)

      const w = size * 0.6
      const h = size

      // Three petal shape variations
      ctx.beginPath()
      if (petalType === 0) {
        // Classic sakura petal — rounded with notch
        ctx.moveTo(0, -h * 0.5)
        ctx.bezierCurveTo(w * 1.0, -h * 0.35, w * 0.9, h * 0.15, w * 0.3, h * 0.4)
        ctx.bezierCurveTo(w * 0.1, h * 0.5, 0, h * 0.35, 0, h * 0.3)
        ctx.bezierCurveTo(0, h * 0.35, -w * 0.1, h * 0.5, -w * 0.3, h * 0.4)
        ctx.bezierCurveTo(-w * 0.9, h * 0.15, -w * 1.0, -h * 0.35, 0, -h * 0.5)
      } else if (petalType === 1) {
        // Elongated teardrop petal
        ctx.moveTo(0, -h * 0.5)
        ctx.bezierCurveTo(w * 0.7, -h * 0.3, w * 0.8, h * 0.1, w * 0.15, h * 0.5)
        ctx.bezierCurveTo(0, h * 0.55, 0, h * 0.55, -w * 0.15, h * 0.5)
        ctx.bezierCurveTo(-w * 0.8, h * 0.1, -w * 0.7, -h * 0.3, 0, -h * 0.5)
      } else {
        // Wide rounded petal
        ctx.moveTo(0, -h * 0.45)
        ctx.bezierCurveTo(w * 1.2, -h * 0.2, w * 1.0, h * 0.3, 0, h * 0.45)
        ctx.bezierCurveTo(-w * 1.0, h * 0.3, -w * 1.2, -h * 0.2, 0, -h * 0.45)
      }
      ctx.closePath()

      // Gradient fill — soft pink with variations
      const baseR = 255
      const baseG = Math.max(0, Math.min(255, 183 + hue))
      const baseB = Math.max(0, Math.min(255, 197 + hue * 0.5))
      const midR = 255
      const midG = Math.max(0, Math.min(255, 155 + hue * 0.8))
      const midB = Math.max(0, Math.min(255, 175 + hue * 0.4))
      const tipR = 255
      const tipG = Math.max(0, Math.min(255, 220 + hue * 0.3))
      const tipB = Math.max(0, Math.min(255, 230 + hue * 0.2))

      const gradient = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5)
      gradient.addColorStop(0, `rgba(${baseR},${baseG},${baseB},${opacity})`)
      gradient.addColorStop(0.4, `rgba(${midR},${midG},${midB},${opacity * 0.95})`)
      gradient.addColorStop(1, `rgba(${tipR},${tipG},${tipB},${opacity * 0.7})`)
      ctx.fillStyle = gradient
      ctx.fill()

      // Soft outer glow for depth
      ctx.shadowColor = `rgba(255,183,197,${opacity * 0.25})`
      ctx.shadowBlur = 6

      // Center vein
      ctx.beginPath()
      ctx.moveTo(0, -h * 0.35)
      ctx.quadraticCurveTo(w * 0.05, 0, 0, h * 0.3)
      ctx.strokeStyle = `rgba(255,140,165,${opacity * 0.25})`
      ctx.lineWidth = 0.6
      ctx.stroke()

      // Secondary veins
      ctx.beginPath()
      ctx.moveTo(0, -h * 0.15)
      ctx.quadraticCurveTo(w * 0.25, h * 0.05, w * 0.2, h * 0.2)
      ctx.moveTo(0, -h * 0.15)
      ctx.quadraticCurveTo(-w * 0.25, h * 0.05, -w * 0.2, h * 0.2)
      ctx.strokeStyle = `rgba(255,160,180,${opacity * 0.15})`
      ctx.lineWidth = 0.4
      ctx.stroke()

      ctx.restore()
    },
    []
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      const { w, h } = dimensionsRef.current
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(render)
        return
      }

      const dpr = window.devicePixelRatio || 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const globalProgress = progressRef.current

      for (const petal of ALL_PETALS) {
        if (globalProgress < petal.phaseStart || globalProgress > petal.phaseEnd) continue
        const localProgress =
          (globalProgress - petal.phaseStart) / (petal.phaseEnd - petal.phaseStart)

        let px: number
        let py: number

        if (localProgress < petal.spiralOnset) {
          // ── LINEAR PHASE: wind blows petal in a straight-ish path ──
          const linearProgress = localProgress / petal.spiralOnset

          px =
            petal.startX * w +
            Math.cos(petal.linearAngle) * petal.linearSpeed * linearProgress * petal.depth
          py =
            petal.startY * h +
            Math.sin(petal.linearAngle) * petal.linearSpeed * linearProgress * petal.depth +
            // Gentle floating wobble
            Math.sin(linearProgress * Math.PI * 4) * 18 * petal.depth +
            // Slight vertical drift (gravity)
            linearProgress * 30 * petal.depth
        } else {
          // ── SPIRAL PHASE: petal caught in wind vortex ──
          // Compute where linear phase would have ended
          const linearEndX =
            petal.startX * w +
            Math.cos(petal.linearAngle) * petal.linearSpeed * 1.0 * petal.depth
          const linearEndY =
            petal.startY * h +
            Math.sin(petal.linearAngle) * petal.linearSpeed * 1.0 * petal.depth +
            30 * petal.depth

          const spiralProgress =
            (localProgress - petal.spiralOnset) / (1 - petal.spiralOnset)

          // Spiral center — where the vortex is centered
          const spiralCenterX =
            petal.startX * w +
            Math.cos(petal.linearAngle) * petal.linearSpeed * 0.65 * petal.depth +
            petal.spiralCenterOffsetX * petal.depth
          const spiralCenterY =
            petal.startY * h +
            Math.sin(petal.linearAngle) * petal.linearSpeed * 0.65 * petal.depth +
            petal.spiralCenterOffsetY * petal.depth

          // Radius decays — spiral tightens
          const currentRadius =
            petal.spiralRadius * petal.depth * (1 - spiralProgress * petal.spiralDecay)

          // Smoothstep easing for acceleration into spiral
          const t = spiralProgress
          const easedT = t * t * (3 - 2 * t)
          const angle = easedT * petal.spiralSpeed * Math.PI * 2

          // Blend from linear end position into the spiral orbit
          const blendIn = Math.min(spiralProgress * 4, 1) // blend over first 25%
          const spiralX = spiralCenterX + Math.cos(angle) * currentRadius
          const spiralY = spiralCenterY + Math.sin(angle) * currentRadius

          px = linearEndX * (1 - blendIn) + spiralX * blendIn
          py = linearEndY * (1 - blendIn) + spiralY * blendIn

          // Continued forward drift (wind doesn't stop during spiral)
          px += spiralProgress * 80 * petal.depth
          // Gentle gravity during spiral
          py += spiralProgress * 40 * petal.depth + Math.sin(spiralProgress * Math.PI * 3) * 15
        }

        // ── Self-rotation — tumbling in the wind ──
        const selfRotation = localProgress * petal.rotationSpeed

        // ── Opacity: smooth fade in/out ──
        let alpha = petal.opacity
        if (localProgress < 0.06) {
          alpha *= localProgress / 0.06
        } else if (localProgress > 0.88) {
          alpha *= (1 - localProgress) / 0.12
        }

        // ── Scale wobble — slight pulsing for depth ──
        // (handled by size already being depth-scaled)

        drawPetal(ctx, px, py, petal.size, selfRotation, alpha, petal.hue, petal.petalType, dpr)
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [drawPetal])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[5] pointer-events-none"
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

// ─── Contact Section ──────────────────────────────────────────────────────────

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [formData, setFormData] = useState({ name: '', phone: '', comment: '' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Parallax on background
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const inputClasses =
    'w-full bg-transparent border-0 border-b border-white/20 py-4 px-0 text-kimono-white placeholder:text-white/40 focus:outline-none focus:border-lime-accent transition-colors duration-200'

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image with parallax */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: STANDARD_EASE }}
        className="absolute inset-0 z-0"
        style={{ y: bgY }}
      >
        <img
          src="/assets/contact-cherry-fuji.jpg"
          alt="Cherry blossoms framing Mount Fuji at sunrise"
          className="w-full h-full object-cover"
          style={{ minHeight: '115%' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.2) 50%, rgba(10,10,10,0.4) 100%)',
          }}
        />
      </motion.div>

      {/* 120 canvas-rendered sakura petals with wind→spiral physics */}
      <SakuraCanvas scrollYProgress={scrollYProgress} />

      {/* Form Panel */}
      <div className="relative z-10 page-padding w-full">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: STANDARD_EASE }}
          className="glass-panel p-12 max-w-[480px]"
        >
          <h2
            className="font-editorial text-kimono-white leading-snug"
            style={{ fontSize: 'clamp(20px, 2.5vw, 28px)' }}
          >
            Want to join us, but still have questions?
          </h2>

          <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.12em] text-lime-accent">
            LEAVE A REQUEST
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClasses}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClasses}
            />
            <textarea
              placeholder="Comment"
              rows={3}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className={`${inputClasses} resize-none`}
            />

            <button
              type="submit"
              className="mt-4 w-full py-[18px] rounded-full bg-kimono-white text-mist-black font-medium text-sm uppercase tracking-[0.1em] hover:bg-lime-accent transition-colors duration-300"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              SEND
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
