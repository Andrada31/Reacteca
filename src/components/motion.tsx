import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { easeOut, staggerItem } from '@/lib/motion';

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut, delay } }),
};

const viewport = { once: true, margin: '-60px' } as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Fades and lifts its content in, the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div className={className} variants={revealVariants} custom={delay} initial="hidden" whileInView="show" viewport={viewport}>
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between children. */
  stagger?: number;
}

/** Reveals its <StaggerItem> children one after another when it scrolls into view. */
export function Stagger({ children, className, stagger = 0.07 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
