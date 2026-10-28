/*
 * Modelled on the "Accelerators" slider on The JADA Squad's site:
 * https://www.jadasquad.com
 */
import { useId, useLayoutEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SpotlightSlide {
  image: string;
  alt?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Short labels shown as pills in the top-right corner. */
  tags?: string[];
}

export interface SpotlightCarouselProps extends Omit<ComponentProps<'section'>, 'children'> {
  slides: SpotlightSlide[];
  /** The slide in the spotlight, when controlled. Update it from `onIndexChange`. */
  index?: number;
  /** The slide in the spotlight at first, when uncontrolled. */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
}

/** How small the slides beside the spotlight are. */
const SIDE_SCALE = 0.6;
const glide = { type: 'spring', duration: 0.7, bounce: 0 } as const;
// The incoming slide overshoots to about 102% before settling; the outgoing one shrinks without a bounce.
const pop = { type: 'spring', duration: 0.6, bounce: 0.3, delay: 0.05 } as const;
const settle = { type: 'spring', duration: 0.6, bounce: 0 } as const;
const fade = { duration: 0.6, ease: [0.22, 1, 0.36, 1] } as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function SpotlightCarousel({
  slides,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  className,
  onKeyDown,
  'aria-label': ariaLabel = 'Carousel',
  ...props
}: SpotlightCarouselProps) {
  const reduceMotion = useReducedMotion();
  const last = Math.max(slides.length - 1, 0);
  const controlled = indexProp !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(() => clamp(defaultIndex, 0, last));
  const index = clamp(controlled ? indexProp : uncontrolledIndex, 0, last);
  // Where the track is, in slides: whole numbers at rest, fractional while dragging or gliding.
  const position = useMotionValue(index);
  // Distance between neighbouring slide centres, in pixels.
  const pitch = useMotionValue(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const panStart = useRef(0);
  const panned = useRef(false);
  const stageId = useId();

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const slide = stage.firstElementChild;
      if (!(slide instanceof HTMLElement)) return;
      // Leaves `gap` between the spotlit slide and a shrunken neighbour.
      const gap = Math.max(16, stage.clientWidth * 0.08);
      pitch.set((slide.offsetWidth * (1 + SIDE_SCALE)) / 2 + gap);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [pitch]);

  // Glides to the spotlit slide whenever it changes, from a drag, a button, a key or a controlled `index`.
  // It starts from wherever the track is, keeping a released drag's speed.
  useLayoutEffect(() => {
    const controls = animate(position, index, reduceMotion ? { duration: 0 } : glide);
    return () => controls.stop();
  }, [index, position, reduceMotion]);

  const go = (next: number) => {
    const target = clamp(next, 0, last);
    if (target === index) {
      // Nothing changes, so a short drag springs back into place.
      animate(position, index, reduceMotion ? { duration: 0 } : glide);
      return;
    }
    if (!controlled) setUncontrolledIndex(target);
    onIndexChange?.(target);
  };

  const handlePan = (_: PointerEvent, info: PanInfo) => {
    const size = pitch.get();
    if (!size) return;
    let next = panStart.current - info.offset.x / size;
    // Rubber-band past the first and last slide.
    if (next < 0) next *= 0.3;
    if (next > last) next = last + (next - last) * 0.3;
    position.set(next);
  };

  const handlePanEnd = (_: PointerEvent, info: PanInfo) => {
    const size = pitch.get();
    if (!size) return;
    // Where the track would coast to, so a quick flick travels further than a slow drag.
    const projected = panStart.current - (info.offset.x + info.velocity.x * 0.2) / size;
    let target = Math.round(projected);
    // A short but deliberate swipe still moves one slide.
    if (target === index && Math.abs(info.offset.x) > Math.min(80, size * 0.15)) {
      target = index + (info.offset.x < 0 ? 1 : -1);
    }
    go(target);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowLeft') go(index - 1);
    else if (event.key === 'ArrowRight') go(index + 1);
    else return;
    event.preventDefault();
  };

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      // A container, so sizes follow the space the carousel has. overflow-x-clip hides the slides
      // beyond the edges without cutting off the spotlit slide's pop.
      className={cn('@container w-full overflow-x-clip', className)}
      {...props}
    >
      <motion.div
        ref={stageRef}
        id={stageId}
        tabIndex={0}
        onPointerDown={() => {
          panned.current = false;
        }}
        onPanStart={() => {
          panned.current = true;
          position.stop();
          panStart.current = position.get();
        }}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        className="grid cursor-grab touch-pan-y place-items-center rounded-[2rem] outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
      >
        {slides.map((slide, slideIndex) => (
          <Slide
            // Slides are a static, ordered list, so their position is a stable key.
            key={slideIndex}
            slide={slide}
            slideIndex={slideIndex}
            count={slides.length}
            active={slideIndex === index}
            position={position}
            pitch={pitch}
            reduceMotion={!!reduceMotion}
            onSelect={() => {
              if (!panned.current) go(slideIndex);
            }}
          />
        ))}
      </motion.div>

      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {slides.length}
      </p>

      <div className="mt-6 flex justify-center gap-3 @2xl:mt-8">
        <Button
          size="icon-lg"
          aria-label="Previous slide"
          aria-controls={stageId}
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="bg-foreground text-background hover:bg-foreground/80 [&_svg:not([class*='size-'])]:size-5"
        >
          <ArrowLeft />
        </Button>
        <Button
          size="icon-lg"
          aria-label="Next slide"
          aria-controls={stageId}
          disabled={index === last}
          onClick={() => go(index + 1)}
          className="bg-foreground text-background hover:bg-foreground/80 [&_svg:not([class*='size-'])]:size-5"
        >
          <ArrowRight />
        </Button>
      </div>
    </section>
  );
}

interface SlideProps {
  slide: SpotlightSlide;
  slideIndex: number;
  count: number;
  active: boolean;
  position: MotionValue<number>;
  pitch: MotionValue<number>;
  reduceMotion: boolean;
  onSelect: () => void;
}

function Slide({ slide, slideIndex, count, active, position, pitch, reduceMotion, onSelect }: SlideProps) {
  // Every slide sits in the same grid cell; its offset from the spotlight places it.
  const x = useTransform(() => (slideIndex - position.get()) * pitch.get());

  return (
    <motion.div
      role="group"
      aria-roledescription="slide"
      aria-label={`${slideIndex + 1} of ${count}`}
      aria-hidden={!active}
      initial={false}
      // The spotlit slide pops up to full size in colour, just after the track starts gliding;
      // the others shrink and fade to gray.
      animate={{
        scale: active ? 1 : SIDE_SCALE,
        opacity: active ? 1 : 0.35,
        filter: active ? 'grayscale(0)' : 'grayscale(1)',
      }}
      transition={{
        scale: reduceMotion ? { duration: 0 } : active ? pop : settle,
        opacity: fade,
        filter: fade,
      }}
      style={{ x, zIndex: active ? 1 : 0 }}
      onClick={active ? undefined : onSelect}
      className={cn(
        'relative col-start-1 row-start-1 aspect-[4/5] w-[80%] max-w-240 overflow-hidden rounded-[1.5rem] rounded-tl-[4rem] bg-muted @xl:aspect-[16/10] @2xl:w-[64%] @2xl:rounded-[1.75rem] @2xl:rounded-tl-[6rem] @4xl:aspect-[12/5]',
        !active && 'cursor-pointer',
      )}
    >
      <img
        src={slide.image}
        alt={slide.alt ?? ''}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />

      {slide.tags && slide.tags.length > 0 && (
        <ul className="absolute top-4 right-4 flex max-w-[60%] flex-wrap justify-end gap-1.5 @2xl:top-5 @2xl:right-5">
          {slide.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="absolute inset-x-3 bottom-3 rounded-[1.25rem] bg-background/85 p-4 text-foreground backdrop-blur-md @2xl:right-auto @2xl:bottom-5 @2xl:left-5 @2xl:max-w-md @2xl:p-5">
        <h3 className="text-lg font-semibold tracking-[-0.035em] @2xl:text-2xl">{slide.title}</h3>
        {slide.description && (
          <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground @2xl:text-base">{slide.description}</div>
        )}
      </div>
    </motion.div>
  );
}
