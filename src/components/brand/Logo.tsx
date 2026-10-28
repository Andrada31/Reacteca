import { motion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
}

/** The React atom in the accent color, with the wordmark. The atom spins on hover. */
export function Logo({ showWordmark = true, className }: LogoProps) {
  return (
    <motion.span className={cn('inline-flex items-center gap-2', className)} initial="rest" whileHover="hover">
      <motion.svg
        viewBox="-11.5 -10.232 23 20.463"
        className="size-7 shrink-0 text-primary-strong"
        aria-hidden
        variants={{ rest: { rotate: 0 }, hover: { rotate: 180 } }}
        transition={{ type: 'spring', stiffness: 90, damping: 12 }}
      >
        <circle r="2.05" fill="currentColor" />
        <g fill="none" stroke="currentColor" strokeWidth="1.1">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </motion.svg>
      {showWordmark && <span className="text-[17px] font-bold tracking-tight">{siteConfig.name}</span>}
    </motion.span>
  );
}
