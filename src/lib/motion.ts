import type { Transition, Variants } from 'framer-motion';

/** The app's standard easing: fast out, soft landing. */
export const easeOut = [0.22, 1, 0.36, 1] as const;

/** Spring for sliding selection indicators (tabs, segmented controls). */
export const indicatorSpring: Transition = { type: 'spring', bounce: 0.18, duration: 0.45 };

/** Fade-and-lift for children of <Stagger>; spread into your own variants to add states such as hover. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};
