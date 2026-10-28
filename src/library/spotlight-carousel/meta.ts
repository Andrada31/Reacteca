import { defineComponent } from '@/registry/define';

export default defineComponent({
  name: 'Spotlight Carousel',
  description:
    'An image carousel that puts one slide in the spotlight: full size and in colour, with smaller, faded slides on either side. Drag, swipe or use the arrow buttons to move between slides.',
  category: 'media',
  tags: ['carousel', 'slider', 'gallery', 'drag', 'framer-motion'],
  status: 'new',
  addedAt: '2026-10-28',
  inspiration: [{ label: 'The JADA Squad · Accelerators', href: 'https://www.jadasquad.com' }],
  registryDependencies: ['button'],
  dependencies: ['framer-motion', 'lucide-react'],
  features: [
    'The spotlit slide is full size and in colour; the slides beside it are shrunk to 60%, faded to 35% opacity and turned grayscale.',
    'Dragging with the mouse or swiping with a finger moves the whole track under the pointer; past the first or last slide it rubber-bands at 30% of the distance. Vertical swipes still scroll the page.',
    'On release the track glides to the nearest slide on a spring, taking the flick speed into account; a short but deliberate swipe (over 80px) always moves one slide.',
    'When a new slide reaches the spotlight it pops up to full size with a slight overshoot and fades into colour, while the previous one shrinks and fades to gray.',
    'Round previous / next buttons sit below the slides and are disabled at either end. Clicking a side slide brings it into the spotlight, and the arrow keys work while focus is inside the carousel.',
    'Marked up as a carousel region with labelled slides; side slides are hidden from screen readers and a polite live region announces "Slide N of M". With reduced motion, slides jump instead of gliding and popping.',
  ],
  props: [
    {
      name: 'slides',
      type: 'SpotlightSlide[]',
      required: true,
      description:
        'The slides: `{ image, alt?, title, description?, tags? }`. `tags` are short labels shown as pills in the top-right corner.',
    },
    { name: 'defaultIndex', type: 'number', default: '0', description: 'The slide in the spotlight at first.' },
    { name: 'onIndexChange', type: '(index: number) => void', description: 'Called when a different slide moves into the spotlight.' },
    { name: 'aria-label', type: 'string', default: "'Carousel'", description: 'Accessible name for the carousel region.' },
    { name: 'className', type: 'string', description: 'Classes for the root `<section>`.' },
  ],
  prompt: `Track: no scrolling element. Every slide sits in the same CSS grid cell (place-items-center, col-start-1 row-start-1), and a shared MotionValue \`position\` (in slides: whole numbers at rest, fractional while dragging or gliding) places them: each slide's x = (slideIndex − position) × pitch, via useTransform(() => …). pitch = slideWidth × (1 + 0.6) / 2 + gap, where gap = max(16px, 8% of the stage width), so the spotlit slide and a shrunken neighbour are exactly \`gap\` apart. A ResizeObserver on the stage re-measures pitch (offsetWidth ignores transforms). The root is overflow-x-clip, which hides the far slides but lets the pop overshoot vertically.

Dragging: framer-motion pan gestures (onPanStart / onPan / onPanEnd) on the stage, with touch-action: pan-y. On pan start stop any running animation and remember position. While panning, position = start − offset.x / pitch, scaled to 30% beyond 0 or the last index. On release, target = round(start − (offset.x + velocity.x × 0.2) / pitch); if that's still the current slide but |offset.x| > min(80, 15% of pitch), move one slide in the drag direction. Then animate(position, target, spring { duration 0.7, bounce 0 }), which also springs a short drag back. A ref set on pan start and cleared on pointerdown stops the click that follows a drag from selecting a side slide.

Spotlight: each slide animates scale 1 / 0.6, opacity 1 / 0.35 and filter grayscale(0) / grayscale(1). The incoming slide scales on a gentle spring { duration 0.6, bounce 0.3 } delayed 0.05s, so it pops just after the glide starts and overshoots only to about 1.02; the outgoing slide shrinks on { duration 0.6, bounce 0 }, so it never dips below 0.6. Opacity and filter tween 0.6s with ease [0.22, 1, 0.36, 1]. The active slide gets z-index 1.

Look: slides are aspect 4/5 at 80% width in narrow containers, 16/10 from @xl, 64% width from @2xl and 12/5 from @4xl (max 60rem), with rounded-[1.75rem] corners and a much larger top-left corner (rounded-tl-[6rem], 4rem when narrow). No gradients over the photo: the title and description sit in a frosted bg-background/85 backdrop-blur-md panel (rounded-[1.25rem]) in the bottom-left, tags are frosted pills in the top-right. The buttons are size-10 bg-foreground / text-background circles with arrow icons, centred below.`,
  // Full-bleed, so side slides run to the canvas edge instead of stopping at its padding.
  preview: { layout: 'fullscreen', height: 720 },
});
