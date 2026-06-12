import { motion } from 'framer-motion'

interface SectionHeadingProps {
  text: string
  align?: 'center' | 'left'
}

export default function SectionHeading({ text, align = 'center' }: SectionHeadingProps) {
  if (align === 'center') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-6 w-full"
      >
        <div className="flex-1 h-[1px] bg-white/15" />
        <h2
          className="font-display font-light uppercase tracking-[0.02em] text-kimono-white shrink-0"
          style={{ fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 0.95 }}
        >
          {text}
        </h2>
        <div className="flex-1 h-[1px] bg-white/15" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-6 w-full"
    >
      <h2
        className="font-display font-light uppercase tracking-[0.02em] text-kimono-white shrink-0"
        style={{ fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 0.95 }}
      >
        {text}
      </h2>
      <div className="flex-1 h-[1px] bg-white/15" />
    </motion.div>
  )
}
