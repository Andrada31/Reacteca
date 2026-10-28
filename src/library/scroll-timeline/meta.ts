import { defineComponent } from '@/registry/define';

export default defineComponent({
  name: 'Scroll Timeline',
  description:
    'A vertical list of numbered steps joined by connectors, where the step you have scrolled to lights up. Use it for process, onboarding or roadmap sections.',
  category: 'data-display',
  tags: ['timeline', 'steps', 'process', 'scroll', 'framer-motion'],
  status: 'new',
  addedAt: '2026-10-28',
  inspiration: [{ label: 'The JADA Squad · How JADA works', href: 'https://www.jadasquad.com' }],
  registryDependencies: ['button'],
  dependencies: ['framer-motion'],
  features: [
    'A step becomes active when the centre of its marker scrolls past the activation line (half-way down the viewport by default); before any has, the first step is active.',
    'Over the last stretch of scrolling the activation line slides down to the bottom edge, so the final steps still activate when the timeline ends near the bottom of the page.',
    'Each connector between two markers fills with the accent colour in step with scrolling; its fill reaches the next marker just before that step activates.',
    'The active step shows its label in the accent colour and its title and description at full contrast; the others fall back to muted text. Markers up to and including the active one are filled with the accent, later ones are pale.',
    'The active marker pops to 1.12× on a spring; with reduced motion it only changes colour.',
    'Spacing and type sizes follow the width the timeline has (a container query at 28rem), not the viewport, so it fits narrow columns and phone screens alike.',
    'Renders an ordered list and marks the active step with aria-current="step". Works with the window or any scrolling element passed as `container`.',
  ],
  props: [
    {
      name: 'steps',
      type: 'ScrollTimelineStep[]',
      required: true,
      description:
        'The steps, in order: `{ title, description?, icon?, label? }`. `icon` defaults to the step number and `label` to "Step N".',
    },
    {
      name: 'threshold',
      type: 'number',
      default: '0.5',
      description: 'Where a step becomes active, as a fraction of the viewport (or container) height from its top.',
    },
    {
      name: 'container',
      type: 'RefObject<HTMLElement | null>',
      description: 'The element that scrolls, when it isn’t the window.',
    },
    { name: 'onActiveChange', type: '(index: number) => void', description: 'Called when a different step becomes active.' },
    { name: 'className', type: 'string', description: 'Classes for the `<ol>`.' },
  ],
  prompt: `Tracking: one scroll listener (on the window, or on \`container\`) plus window resize and a ResizeObserver on the list, throttled with requestAnimationFrame. Attach the scroll listener and run the first update in a queueMicrotask from the layout effect: a ref on an element wrapping the timeline is only set after the timeline's own layout effects run, and the microtask still runs before paint. Each frame computes the activation line in client coordinates: top + height × (threshold + (1 − threshold) × p), where p goes 0 → 1 over the last min(height × (1 − threshold), scrollRange) pixels of scroll (p stays 0 if the page can't scroll). For a \`container\`, convert its clientHeight, scrollHeight and scrollTop to screen pixels (× rect.height / offsetHeight), so it still works inside a scaled parent. The active index is the last marker whose getBoundingClientRect centre is ≤ the line (default 0). React state only changes when the index does.

Connectors: every step except the last has an absolutely positioned track from 8px under its marker to 8px above the next (top-12 bottom-2 left-5 -translate-x-1/2, w-1 rounded-full bg-foreground/15, a touch darker than bg-muted so it still reads in dark mode). Inside it a full-size bg-primary bar with origin-top gets style.transform = scaleY(clamp((line − track.top) / track.height, 0, 1)), written straight to the DOM each frame, not through React. Don't use Tailwind's scale-y-* there: in v4 it sets the separate \`scale\` property, which would stack with the inline transform.

Look: no borders or lines, only tone. The ol is an @container with w-full (inline-size containment would otherwise let it shrink to nothing in a centring parent), and every size step uses container variants, not viewport ones. Each li is a two-column grid (auto, minmax(0, 1fr); gap-x-5 / @md:gap-x-7) with pb-20 / @md:pb-28 between steps. Markers are size-10 circles (icons size-5): reached = bg-primary text-primary-foreground, upcoming = bg-primary/15 text-foreground/45; the active one animates scale 1.12 with a spring (stiffness 420, damping 18). Content starts at pt-2.5 so the label lines up with the marker's centre: label text-sm uppercase tracking-wide, title text-2xl/@md:text-3xl semibold tracking-[-0.035em], description text-base/@md:text-lg leading-relaxed. Active label colour is color-mix(in oklab, var(--primary) 60%, var(--foreground)), which darkens the cyan in light mode (plain cyan is too faint as small text on white) and lightens it in dark mode. Text colours fade with transition-colors over 300ms.

Demo layout: an @container wrapper around a section that becomes two columns at @4xl (56rem), with the heading, intro and a primary pill button sticky in the left column (@4xl:sticky @4xl:top-24 @4xl:self-start) and the timeline on the right; narrower, they stack.`,
  preview: { layout: 'padded', height: 720 },
});
