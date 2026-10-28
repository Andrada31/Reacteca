/*
 * Inspired by the project dock of The Design Office of David McGillivray (https://dmcg.co),
 * as seen on https://dmcg.co/work/infinitemachine.
 */
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionStyle,
  type Transition,
  type Variants,
} from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { playKeySound } from './key-sound';

export interface DockItem {
  /** Unique key. */
  id: string;
  /** Accessible name, also shown in the tooltip. */
  label: string;
  /** Secondary text shown after the label in the tooltip, e.g. "4 new". */
  hint?: string;
  /** An icon, e.g. from lucide-react. SVGs inside are sized to fit the item. */
  icon: ReactNode;
  /** Renders the item as a link. */
  href?: string;
  onSelect?: () => void;
}

export interface DockProps extends Omit<ComponentProps<'div'>, 'children'> {
  items: DockItem[];
  /** The current item, shown as a raised chip and marked `aria-current`. */
  activeId?: string;
  /** Controlled visibility. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Controlled size multiplier. */
  scale?: number;
  defaultScale?: number;
  minScale?: number;
  maxScale?: number;
  onScaleChange?: (scale: number) => void;
  tooltipSide?: 'top' | 'bottom';
  /** Plays a short keyboard click, like a phone keyboard, as the pointer or keyboard focus moves onto each item. */
  sound?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** How far past its size limits a drag can stretch the dock: a little when growing, half that when shrinking. */
const growGive = 0.05;
const shrinkGive = 0.025;

/**
 * Rubber-bands a scale past [min, max] like an elastic band: the further the pointer pulls,
 * the harder it resists, approaching but never passing the give.
 */
function rubberBand(value: number, min: number, max: number) {
  const band = (over: number, give: number) => (give * over) / (give + over);
  if (value > max) return max + band(value - max, growGive);
  if (value < min) return min - band(min - value, shrinkGive);
  return value;
}

/** Letting go of the dock: it overshoots, springs back and settles with a small wobble. */
const releaseSpring: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 14,
  mass: 0.85,
  restDelta: 0.0007,
  restSpeed: 0.006,
};

/**
 * The kick the dock gets when let go, in scale per second: in the direction it was last resized, fast
 * enough to visibly overshoot even after a slow drag, and half as strong when shrinking.
 */
function releaseVelocity(velocity: number, direction: number) {
  const sign = Math.abs(velocity) > 0.05 ? Math.sign(velocity) : Math.sign(direction);
  return sign * clamp(0.6 * Math.abs(velocity), 0.6, 1.5) * (sign < 0 ? 0.5 : 1);
}

interface DragState {
  center: number;
  offset: number;
  /** Scale when the drag started. */
  scale: number;
  /** The scale the pointer asks for, before clamping or rubber-banding. */
  raw: number;
  /** Sign of the last change, for the kick when the pointer stopped before letting go. */
  direction: number;
  samples: Array<{ time: number; raw: number }>;
}

/** Scale per second over the last 80ms of a drag; 0 if the pointer had stopped. */
function dragVelocity(samples: DragState['samples']) {
  const last = samples.at(-1);
  if (!last || performance.now() - last.time > 80) return 0;
  const first = samples.find((sample) => last.time - sample.time <= 80) ?? last;
  return first === last ? 0 : (last.raw - first.raw) / ((last.time - first.time) / 1000);
}

/*
 * The tray is revealed with a clip-path driven by --dock-reveal (0 → 1). At 0 it is
 * a circle the size of the menu button (16 units), centred where that button sits:
 * the middle of the whole dock, which is half the close button plus gap (13 units)
 * left of the tray's own middle. The corner radius eases from the circle's 8 units
 * to the tray's 6.
 */
const collapsed = '(1 - var(--dock-reveal, 1))';
const trayClip = `inset(0 calc((50% - var(--spacing) * 1.5) * ${collapsed}) 0 calc((50% - var(--spacing) * 14.5) * ${collapsed}) round calc(var(--spacing) * (6 + 2 * ${collapsed})))`;

const dockVariants: Variants = {
  hidden: (reduce: boolean) => ({
    '--dock-reveal': 0,
    transition: reduce ? { duration: 0 } : { duration: 0.4, ease: [0.65, 0, 0.35, 1], delay: 0.05 },
  }),
  show: (reduce: boolean) => ({
    '--dock-reveal': 1,
    transition: reduce ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

/** The close button and the menu icon spin in and out. */
const popVariants: Variants = {
  hidden: (reduce: boolean) => ({
    opacity: 0,
    scale: reduce ? 1 : 0.4,
    rotate: reduce ? 0 : -90,
    transition: { duration: 0.15 },
  }),
  show: (reduce: boolean) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: reduce ? { duration: 0.2 } : { type: 'spring', bounce: 0.4, duration: 0.5, delay: 0.15 },
  }),
};

interface ItemOrder {
  /** Steps from the middle item. */
  distance: number;
  farthest: number;
  reduce: boolean;
}

/** Items pop in from the middle outwards as the tray opens, and leave outside-in as it closes. */
const itemVariants: Variants = {
  hidden: ({ distance, farthest, reduce }: ItemOrder) => ({
    opacity: 0,
    scale: reduce ? 1 : 0.4,
    y: reduce ? 0 : 8,
    transition: { duration: 0.18, ease: 'easeIn', delay: reduce ? 0 : (farthest - distance) * 0.03 },
  }),
  show: ({ distance, reduce }: ItemOrder) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: reduce
      ? { duration: 0.2 }
      : { type: 'spring', bounce: 0.45, duration: 0.55, delay: 0.1 + distance * 0.045 },
  }),
};

/** A bouncy spring for hover growth: overshoots a little, then settles. */
const popSpring: Transition = { type: 'spring', stiffness: 520, damping: 14 };

/** The icon grows while its item is hovered and dips when pressed (driven by the item's hover/tap state). */
const iconVariants: Variants = {
  hover: { scale: 1.35 },
  tap: { scale: 1.15 },
};

const roundButton = 'shrink-0 cursor-pointer bg-muted transition-colors hover:bg-foreground/10';

export function Dock({
  items,
  activeId,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  scale: scaleProp,
  defaultScale = 1,
  minScale = 0.6,
  maxScale = 1.6,
  onScaleChange,
  tooltipSide = 'bottom',
  sound = true,
  className,
  ...props
}: DockProps) {
  const reduce = useReducedMotion() ?? false;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const [uncontrolledScale, setUncontrolledScale] = useState(defaultScale);
  const requestedScale = clamp(scaleProp ?? uncontrolledScale, minScale, maxScale);
  // The largest scale at which the dock fits its container.
  const [fitScale, setFitScale] = useState(Infinity);
  const scale = Math.min(requestedScale, fitScale);
  const largest = Math.min(maxScale, fitScale);
  const [dragging, setDragging] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const [dock, setDock] = useState<HTMLDivElement | null>(null);
  // The scale on screen. It follows `scale`, except while a drag stretches it past the limits and
  // while it springs back after a resize.
  const shown = useMotionValue(scale);
  const springTarget = useRef(scale);
  // Set while the handle is resizing (or pushing past a limit); the dock springs when it's released.
  const resized = useRef(false);
  // The direction of the last resizing key, for the kick when it's released.
  const keyDirection = useRef(0);
  const drag = useRef<DragState | null>(null);

  const springTo = (target: number, velocity: number) => {
    springTarget.current = target;
    animate(shown, target, { ...releaseSpring, velocity });
  };

  // Follow scale changes from props, keys or the container. Mid-spring, retarget it without losing speed.
  useLayoutEffect(() => {
    if (dragging) return;
    if (!shown.isAnimating()) shown.set(scale);
    else if (scale !== springTarget.current) {
      springTarget.current = scale;
      animate(shown, scale, releaseSpring);
    }
  }, [scale, dragging, shown]);

  // Every size is proportional to the scale, so the dock's width at scale 1 is its width divided by the
  // scale on screen. Measured before paint, so a narrow container never shows it overflowing.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !dock) return;
    const measure = () => {
      // Layout widths (offsetWidth, clientWidth) ignore ancestor transforms, unlike getBoundingClientRect.
      const widthAtOne = dock.offsetWidth / shown.get();
      if (!root.clientWidth || !widthAtOne) return;
      const next = root.clientWidth / widthAtOne;
      setFitScale((previous) => (Math.abs(previous - next) < 0.005 ? previous : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(dock);
    return () => observer.disconnect();
  }, [dock, shown]);
  // Set when the close or menu button is used, so focus follows to its counterpart.
  const moveFocus = useRef(false);

  const focusOnMount = useCallback((node: HTMLElement | null) => {
    if (node && moveFocus.current) {
      moveFocus.current = false;
      node.focus();
    }
  }, []);

  const setOpen = (next: boolean) => {
    moveFocus.current = true;
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const toScale = (value: number) => Math.round(clamp(value, minScale, maxScale) * 1000) / 1000;

  const setScale = (next: number) => {
    const value = toScale(next);
    if (value === requestedScale) return;
    if (scaleProp === undefined) setUncontrolledScale(value);
    onScaleChange?.(value);
    resized.current = true;
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dock || event.button !== 0) return;
    const { left, width } = dock.getBoundingClientRect();
    const center = left + width / 2;
    const offset = event.clientX - center;
    if (offset <= 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    // Catches it mid-spring: the drag starts from the size on screen.
    shown.stop();
    drag.current = { center, offset, scale: shown.get(), raw: shown.get(), direction: 0, samples: [] };
    resized.current = false;
    setDragging(true);
  };

  // The dock grows about its centre, so scaling by the pointer's distance from it keeps the handle under the pointer.
  // Past the limits it rubber-bands instead of stopping dead.
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const raw = (state.scale * (event.clientX - state.center)) / state.offset;
    const now = performance.now();
    if (raw !== state.raw) state.direction = Math.sign(raw - state.raw);
    state.raw = raw;
    state.samples.push({ time: now, raw });
    while (state.samples.length > 2 && now - state.samples[0].time > 160) state.samples.shift();
    // Pushing past a limit can't change the size, but still counts as resizing.
    if (raw > largest || raw < minScale) resized.current = true;
    shown.set(reduce ? clamp(raw, minScale, largest) : rubberBand(raw, minScale, largest));
    setScale(raw);
  };

  // Letting go after a resize kicks the dock on in the direction it was going, so it overshoots and springs back
  // like an elastic band; let go while stretched past a limit, it snaps back.
  const endDrag = (released: boolean) => {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    setDragging(false);
    const wasResized = resized.current;
    resized.current = false;
    const target = wasResized ? Math.min(toScale(state.raw), fitScale) : scale;
    if (reduce) {
      shown.set(target);
      return;
    }
    const stretched = state.raw !== clamp(state.raw, minScale, largest);
    const kick = released && wasResized && !stretched;
    springTo(target, kick ? releaseVelocity(dragVelocity(state.samples), state.direction) : 0);
  };

  const resizeWithKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowRight: 0.05,
      ArrowUp: 0.05,
      ArrowLeft: -0.05,
      ArrowDown: -0.05,
      PageUp: 0.2,
      PageDown: -0.2,
    };
    let next: number;
    if (event.key in steps) next = scale + steps[event.key];
    else if (event.key === 'Home') next = minScale;
    else if (event.key === 'End') next = maxScale;
    else return;
    event.preventDefault();
    const growing = next > scale || event.key === 'End';
    keyDirection.current = growing ? 1 : -1;
    if (growing ? scale >= largest - 0.001 : scale <= minScale + 0.001) resized.current = true;
    setScale(next);
  };

  // The keyboard gets the same elastic kick, once the resizing key is released.
  const kickAfterKeys = () => {
    if (!resized.current) return;
    resized.current = false;
    if (!reduce) springTo(scale, releaseVelocity(0, keyDirection.current));
  };

  // Everything inside is sized with Tailwind spacing utilities, so scaling Tailwind v4's
  // base unit (--spacing, normally 0.25rem) scales the whole dock.
  const spacing = { '--spacing': `${0.25 * scale}rem` } as CSSProperties;
  const shownSpacing = useTransform(shown, (value) => `${0.25 * value}rem`);
  const middle = (items.length - 1) / 2;

  return (
    // min-w-0 keeps the dock's natural width from propping the wrapper open, so it can be measured.
    <div ref={rootRef} className={cn('flex w-full min-w-0 justify-center', className)} {...props}>
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="dock"
            ref={setDock}
            style={{ '--spacing': shownSpacing } as MotionStyle}
            custom={reduce}
            variants={dockVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="flex shrink-0 items-center gap-4"
          >
            {/* The wrapper spins in and out; the button itself pops on hover. */}
            <motion.span custom={reduce} variants={popVariants} className="flex shrink-0">
              <Button asChild variant="ghost" size="icon" className={cn(roundButton, 'size-9')}>
                <motion.button
                  ref={focusOnMount}
                  type="button"
                  aria-label="Hide dock"
                  onClick={() => setOpen(false)}
                  whileHover={reduce ? undefined : { scale: 1.2 }}
                  whileTap={reduce ? undefined : { scale: 0.9 }}
                  transition={popSpring}
                >
                  <X className="size-4" />
                </motion.button>
              </Button>
            </motion.span>

            <div
              className="flex h-16 items-center rounded-[--spacing(6)] bg-muted pr-1 pl-2.5 select-none"
              style={{ clipPath: trayClip }}
            >
              <TooltipProvider delayDuration={150}>
                <nav aria-label="Dock" className="h-full">
                  <ul className="flex h-full items-center gap-1">
                    {items.map((item, index) => {
                      const active = item.id === activeId;
                      const itemProps = {
                        'aria-label': item.label,
                        'aria-current': active ? ('page' as const) : undefined,
                        onClick: item.onSelect,
                        onPointerEnter: sound ? playKeySound : undefined,
                        // Keyboard focus only: a click focuses the item too, but the pointer already ticked on the way in.
                        onFocus: (event: FocusEvent<HTMLElement>) => {
                          if (sound && event.currentTarget.matches(':focus-visible')) playKeySound();
                        },
                        custom: { distance: Math.abs(index - middle), farthest: middle, reduce } satisfies ItemOrder,
                        variants: itemVariants,
                        whileHover: reduce ? undefined : 'hover',
                        whileTap: reduce ? undefined : 'tap',
                        className: cn(
                          'flex size-11 cursor-pointer items-center justify-center rounded-[--spacing(3.5)] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                          active
                            ? 'bg-background text-foreground'
                            : 'text-muted-foreground hover:bg-foreground/10 hover:text-foreground',
                        ),
                      };
                      const icon = (
                        <motion.span
                          variants={iconVariants}
                          transition={popSpring}
                          className="flex [&_svg]:size-5.5 [&_svg]:shrink-0"
                        >
                          {item.icon}
                        </motion.span>
                      );
                      return (
                        <li key={item.id} className="flex shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {item.href ? (
                                <motion.a href={item.href} {...itemProps}>
                                  {icon}
                                </motion.a>
                              ) : (
                                <motion.button type="button" {...itemProps}>
                                  {icon}
                                </motion.button>
                              )}
                            </TooltipTrigger>
                            <TooltipPrimitive.Portal>
                              {/* A plain pill under the tray, no arrow. The offset clears the tray's padding. */}
                              <TooltipPrimitive.Content
                                side={tooltipSide}
                                sideOffset={10 * scale + 8}
                                className="z-50 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0"
                              >
                                {item.label}
                                {item.hint && <span className="font-normal text-background/60">{item.hint}</span>}
                              </TooltipPrimitive.Content>
                            </TooltipPrimitive.Portal>
                          </Tooltip>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </TooltipProvider>

              <div
                role="slider"
                tabIndex={0}
                aria-label="Resize dock"
                aria-orientation="horizontal"
                aria-valuemin={Math.round(minScale * 100)}
                aria-valuemax={Math.round(maxScale * 100)}
                aria-valuenow={Math.round(scale * 100)}
                aria-valuetext={`${Math.round(scale * 100)}%`}
                data-dragging={dragging || undefined}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={() => endDrag(true)}
                onPointerCancel={() => endDrag(false)}
                onKeyDown={resizeWithKeys}
                onKeyUp={kickAfterKeys}
                className="group/handle ml-1.5 flex h-10 w-5 shrink-0 cursor-ew-resize touch-none items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="h-8 w-0.75 rounded-full bg-foreground/20 transition-colors group-hover/handle:bg-foreground/40 group-data-dragging/handle:bg-foreground/60" />
              </div>
            </div>
          </motion.div>
        ) : (
          <Button key="menu" asChild variant="ghost" size="icon" className={cn(roundButton, 'size-16')}>
            <motion.button
              ref={focusOnMount}
              type="button"
              aria-label="Show dock"
              onClick={() => setOpen(true)}
              style={spacing}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <motion.span custom={reduce} variants={popVariants} className="flex">
                <Menu className="size-5.5" />
              </motion.span>
            </motion.button>
          </Button>
        )}
      </AnimatePresence>
    </div>
  );
}
