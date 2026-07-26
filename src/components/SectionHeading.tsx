import { motion } from 'framer-motion'

interface SectionHeadingProps {
  text: string
  align?: 'center' | 'left'
}

const EASE = [0.16, 1, 0.3, 1] as const

// Decorative accent dot — animated lime-green circle that appears after the heading
function AccentDot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay, duration: 0.4, ease: EASE }}
      className="inline-block w-[6px] h-[6px] rounded-full bg-lime-accent shrink-0"
      aria-hidden="true"
    />
  )
}

export default function SectionHeading({ text, align = 'center' }: SectionHeadingProps) {
  if (align === 'center') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col items-center gap-4 w-full"
      >
        <div className="flex items-center gap-6 w-full">
          <div className="flex-1 h-[1px] bg-white/15" />
          <h2
            className="font-display font-light uppercase tracking-[0.02em] text-kimono-white shrink-0"
            style={{ fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 0.95 }}
          >
            {text}
          </h2>
          <div className="flex-1 h-[1px] bg-white/15" />
        </div>
        {/* Animated accent dots row */}
        <div className="flex items-center gap-2">
          <AccentDot delay={0.3} />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 32 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
            className="h-[1px] bg-lime-accent/50 overflow-hidden"
          />
          <AccentDot delay={0.5} />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex flex-col gap-4 w-full"
    >
      <div className="flex items-center gap-6 w-full">
        <h2
          className="font-display font-light uppercase tracking-[0.02em] text-kimono-white shrink-0"
          style={{ fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 0.95 }}
        >
          {text}
        </h2>
        <div className="flex-1 h-[1px] bg-white/15" />
      </div>
      {/* Animated accent dots row (left-aligned) */}
      <div className="flex items-center gap-2">
        <AccentDot delay={0.3} />
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 32 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
          className="h-[1px] bg-lime-accent/50 overflow-hidden"
        />
        <AccentDot delay={0.5} />
      </div>
    </motion.div>
  )
}
