/*
 * Modelled on the "How JADA works" process section on The JADA Squad's site:
 * https://www.jadasquad.com
 */
import { useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ScrollTimelineStep {
  title: ReactNode;
  description?: ReactNode;
  /** Shown in the marker circle. Defaults to the step number. SVGs are sized to fit. */
  icon?: ReactNode;
  /** Small text above the title. Defaults to "Step 1", "Step 2"… */
  label?: ReactNode;
}

export interface ScrollTimelineProps extends Omit<ComponentProps<'ol'>, 'children'> {
  steps: ScrollTimelineStep[];
  /** Where a step becomes active, as a fraction of the viewport height from its top. */
  threshold?: number;
  /** The element that scrolls, if it isn't the window (e.g. a scroll area or dialog body). */
  container?: RefObject<HTMLElement | null>;
  onActiveChange?: (index: number) => void;
}

const markerSpring = { type: 'spring', stiffness: 420, damping: 18 } as const;

export function ScrollTimeline({
  steps,
  threshold = 0.5,
  container,
  onActiveChange,
  className,
  ...props
}: ScrollTimelineProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const markers = useRef<(HTMLElement | null)[]>([]);
  const fills = useRef<(HTMLElement | null)[]>([]);
  const listRef = useRef<HTMLOListElement>(null);
  const activeRef = useRef(0);
  const onActiveChangeRef = useRef(onActiveChange);

  useLayoutEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  });

  useLayoutEffect(() => {
    let scroller: HTMLElement | null = null;
    let target: HTMLElement | Window | null = null;
    let disposed = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      let top = 0;
      let height = window.innerHeight;
      let range = document.documentElement.scrollHeight - height;
      let scrolled = window.scrollY;
      if (scroller) {
        const rect = scroller.getBoundingClientRect();
        // Layout sizes (clientHeight, scrollTop…) ignore ancestor transforms, unlike getBoundingClientRect,
        // so convert them to screen pixels for a scroller inside a scaled parent.
        const zoom = scroller.offsetHeight ? rect.height / scroller.offsetHeight : 1;
        top = rect.top + scroller.clientTop * zoom;
        height = scroller.clientHeight * zoom;
        range = (scroller.scrollHeight - scroller.clientHeight) * zoom;
        scrolled = scroller.scrollTop * zoom;
      }

      // The activation line sits at `threshold`, then slides to the bottom edge over the last stretch of
      // scrolling, so steps near the end of the page can still become active.
      const slide = Math.min(height * (1 - threshold), range);
      const progress = slide > 0 ? Math.min(Math.max(1 - (range - scrolled) / slide, 0), 1) : 0;
      const line = top + height * (threshold + (1 - threshold) * progress);

      let next = 0;
      markers.current.forEach((marker, index) => {
        if (!marker) return;
        const rect = marker.getBoundingClientRect();
        if (rect.top + rect.height / 2 <= line) next = index;
      });

      // Each connector fills up to the line, so the fill reaches a marker just as its step lights up.
      fills.current.forEach((fill) => {
        const track = fill?.parentElement;
        if (!fill || !track) return;
        const rect = track.getBoundingClientRect();
        const amount = Math.min(Math.max((line - rect.top) / rect.height, 0), 1);
        fill.style.transform = `scaleY(${amount})`;
      });

      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
        onActiveChangeRef.current?.(next);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    if (listRef.current) observer.observe(listRef.current);

    // An element wrapping the timeline only gets its ref after the timeline's own layout effects have run,
    // so read `container` once the commit is done. The microtask still runs before the browser paints.
    queueMicrotask(() => {
      if (disposed) return;
      scroller = container?.current ?? null;
      target = scroller ?? window;
      target.addEventListener('scroll', schedule, { passive: true });
      update();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      target?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [container, threshold, steps.length]);

  return (
    // A container, so spacing and type sizes follow the width the timeline has rather than the viewport.
    <ol ref={listRef} className={cn('@container flex w-full flex-col', className)} {...props}>
      {steps.map((step, index) => {
        const isActive = index === active;
        const reached = index <= active;

        return (
          <li
            // Steps are a static, ordered list, so their position is a stable key.
            key={index}
            aria-current={isActive ? 'step' : undefined}
            className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 pb-20 last:pb-0 @md:gap-x-7 @md:pb-28"
          >
            <motion.span
              ref={(node) => {
                markers.current[index] = node;
              }}
              aria-hidden
              initial={false}
              animate={{ scale: isActive && !reduceMotion ? 1.12 : 1 }}
              transition={markerSpring}
              className={cn(
                'flex size-10 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors duration-300 [&_svg]:size-5',
                reached ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-foreground/45',
              )}
            >
              {step.icon ?? index + 1}
            </motion.span>

            {index < steps.length - 1 && (
              // The connector runs from just under this marker to just above the next one.
              <span aria-hidden className="absolute top-12 bottom-2 left-5 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-foreground/15">
                <span
                  ref={(node) => {
                    fills.current[index] = node;
                  }}
                  className="block size-full origin-top rounded-full bg-primary"
                />
              </span>
            )}

            <div className="pt-2.5">
              <p
                className={cn(
                  'text-sm font-medium tracking-wide uppercase transition-colors duration-300',
                  // A darker cyan in light mode, so the accent stays readable as small text on white.
                  isActive ? 'text-[color:color-mix(in_oklab,var(--primary)_60%,var(--foreground))]' : 'text-muted-foreground',
                )}
              >
                {step.label ?? `Step ${index + 1}`}
              </p>
              <h3
                className={cn(
                  'mt-2 text-2xl font-semibold tracking-[-0.035em] transition-colors duration-300 @md:text-3xl',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.title}
              </h3>
              {step.description && (
                <div
                  className={cn(
                    'mt-3 max-w-prose text-base leading-relaxed transition-colors duration-300 @md:text-lg',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.description}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
