import { useId } from 'react';
import { motion, type Variants } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { easeOut } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
}

/**
 * Mirror tiles of the disco ball (radius 56 around the origin): a sphere tilted toward the viewer,
 * cut into five rows of square tiles, grouped by tone from lit (upper left) to shaded. The tones stay
 * well apart from the page in both themes, so the ball and its grid read at 1x.
 * The grout between tiles is knocked out by the mask, so the page shows through.
 */
const tiles = [
  {
    className: 'fill-foreground/36 dark:fill-foreground',
    d: 'M-53-18L-53-17L-52-13L-47-23L-41-33L-32-41L-33-44L-31-46L-29-48ZM16-34L31-39L31-46L28-48L11-55L6-55L0-53L6-49L11-42ZM-28-49L-33-43L-23-49L-12-52L0-53L6-55L11-55ZM-33-43L-26-37L-7-33L16-34L11-42L6-49L0-53L-12-52L-23-49Z',
  },
  {
    className: 'fill-foreground/55 dark:fill-foreground/82',
    d: 'M-53 18L-51 21L-47 24L-49 14L-49 2L-47-9L-51-12L-53-15L-53-18ZM-47 24L-41 27L-33 29L-24 31L-25 21L-25 10L-24-2L-33-4L-41-6L-47-9L-49 2L-49 14ZM-24 31L-13 32L-2 33L9 33L9 23L9 11L9 0L-2 0L-13-1L-24-2L-25 10L-25 21Z',
  },
  {
    className: 'fill-foreground/72 dark:fill-foreground/64',
    d: 'M-29 48L-27 49L-21 51L-27 45L-32 38L-35 29L-44 26L-50 22L-53 18ZM9 33L20 32L29 30L38 28L40 18L40 6L38-5L29-3L20-1L9 0L9 11L9 23ZM11 0L24-2L36-4L45-8L41-18L35-29L28-38L22-36L15-34L7-33L9-23L10-12ZM45-8L51-11L53-16L53-18L46-32L41-38L32-45L33-43L31-40L28-38L35-29L41-18Z',
  },
  {
    className: 'fill-foreground/90 dark:fill-foreground/48',
    d: 'M28 49L21 51L0 53L0 56ZM0 56L0 53L-21 51L-28 49ZM2 53L11 53L19 51L25 50L32 44L37 36L40 27L30 30L18 32L4 33L4 42L3 48ZM25 50L29 48L53 18L52 20L48 24L40 27L37 36L32 44ZM-21 51L-14 52L-6 53L2 53L3 48L4 42L4 33L-10 33L-23 31L-35 29L-32 38L-27 45ZM38 28L45 25L50 22L53 19L55 8L55-3L53-14L50-11L45-8L38-5L40 6L40 18ZM53 19L53 18L53-18L53-17L53-14L55-3L55 8ZM29-48L32-45L41-38L46-32Z',
  },
  {
    // Cyan reflections of the lights, where the ball catches them.
    className: 'fill-primary',
    d: 'M-52-13L-47-9L-39-5L-29-3L-26-14L-23-25L-18-35L-24-36L-29-38L-32-41L-41-33L-47-23ZM-29-3L-16-1L-3 0L11 0L10-12L9-23L7-33L-2-33L-10-33L-18-35L-23-25L-26-14Z',
  },
];

/** The half of one React orbit that swings in front of the ball (lower right). */
const frontOrbit = 'M-110 0A110 42 0 0 0 110 0';
const frontOrbitAngle = 300;

/** Orbits spin about the ball's centre (the SVG origin) rather than their own bounding box. */
const spin: Variants = { rest: { rotate: 0 }, hover: { rotate: 180 } };
const spinStyle = { transformBox: 'view-box', originX: 0, originY: 0 } as const;
const spinTransition = { type: 'spring', stiffness: 90, damping: 12 } as const;

/** Four-point sparkle centred on (x, y). */
const sparklePath = (x: number, y: number, r: number) => {
  const k = Math.round(r / 4);
  return `M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}Z`;
};

/** Sparkles in the gaps between the orbits: a big pair on one diagonal, a small pair on the other. */
const sparkles = [
  sparklePath(87, -50, 16),
  sparklePath(-87, 50, 16),
  sparklePath(-87, -50, 9),
  sparklePath(87, 50, 9),
];

/** On hover each sparkle twinkles in turn; a quarter turn leaves a four-point star looking as it was. */
const twinkle: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: (i: number) => ({
    scale: [1, 1.5, 1],
    rotate: 90,
    transition: { duration: 0.6, delay: i * 0.08, ease: easeOut },
  }),
};

/** A disco ball inside the React atom, with the wordmark. On hover the orbits spin and the sparkles twinkle. */
export function Logo({ showWordmark = true, className }: LogoProps) {
  const id = useId();
  const ballMask = `${id}-ball`;
  const orbitMask = `${id}-orbit`;

  return (
    <motion.span className={cn('inline-flex items-center gap-2', className)} initial="rest" whileHover="hover">
      <svg viewBox="-116 -104 232 208" className="size-9 shrink-0 overflow-visible text-primary-display" aria-hidden>
        <defs>
          {/* Grout lines and the gap around the front orbit, cut out of the ball. */}
          <mask id={ballMask}>
            <rect x="-116" y="-116" width="232" height="232" fill="white" />
            <path d={tiles.map((tile) => tile.d).join('')} fill="none" stroke="black" strokeWidth="8" strokeLinejoin="round" />
            <motion.g variants={spin} style={spinStyle} transition={spinTransition}>
              <path
                d={frontOrbit}
                transform={`rotate(${frontOrbitAngle})`}
                fill="none"
                stroke="black"
                strokeWidth="23"
                strokeLinecap="round"
              />
            </motion.g>
          </mask>
          {/* The ball, plus a gap, hides the orbits passing behind it. */}
          <mask id={orbitMask}>
            <rect x="-116" y="-116" width="232" height="232" fill="white" />
            <circle r="62" fill="black" />
          </mask>
        </defs>

        <g mask={`url(#${orbitMask})`}>
          <motion.g variants={spin} style={spinStyle} transition={spinTransition} fill="none" stroke="currentColor" strokeWidth="11">
            <ellipse rx="110" ry="42" />
            <ellipse rx="110" ry="42" transform="rotate(60)" />
            <ellipse rx="110" ry="42" transform="rotate(120)" />
          </motion.g>
        </g>
        <g mask={`url(#${ballMask})`}>
          {tiles.map((tile) => (
            <path key={tile.className} d={tile.d} className={tile.className} />
          ))}
        </g>
        <motion.g variants={spin} style={spinStyle} transition={spinTransition}>
          <path d={frontOrbit} transform={`rotate(${frontOrbitAngle})`} fill="none" stroke="currentColor" strokeWidth="11" />
        </motion.g>

        {sparkles.map((d, i) => (
          <motion.path key={d} d={d} fill="currentColor" variants={twinkle} custom={i} />
        ))}
      </svg>
      {showWordmark && <span className="text-[17px] font-bold tracking-tight">{siteConfig.name}</span>}
    </motion.span>
  );
}
