import { defineComponent } from '@/registry/define';

export default defineComponent({
  name: 'Floating Dock',
  description:
    'A macOS-style dock whose icons magnify as the pointer passes over them, collapsing to a stacked menu button in narrow spaces.',
  category: 'navigation',
  tags: ['dock', 'navigation', 'magnify', 'macos', 'framer-motion'],
  status: 'new',
  addedAt: '2026-10-28',
  inspiration: [{ label: 'Aceternity UI · Floating Dock', href: 'https://ui.aceternity.com/components/floating-dock' }],
  registryDependencies: [],
  dependencies: ['framer-motion', 'lucide-react', '@tabler/icons-react'],
  features: [
    'Icons magnify as the pointer moves along the dock: each grows from 40px to 80px (its glyph from 20px to 40px) as the pointer nears its centre, neighbours within 150px grow in proportion, and a soft spring smooths every change.',
    'Hovering an icon, or reaching it with the keyboard, shows its title in a pill label above it.',
    'In a space narrower than 36rem it becomes a round menu button; opening it stacks the items above, rising in one by one from the bottom and leaving top-down. The switch follows the space the dock has (a container query), not the viewport.',
    'Items are links with accessible names inside a nav landmark; the menu button reports aria-expanded and aria-controls.',
    'Respects reduced motion: no magnification and no sliding, only fades.',
  ],
  props: [
    {
      name: 'items',
      type: 'FloatingDockItem[]',
      required: true,
      description: 'Links to show: `{ title, icon, href }`. `title` is the accessible name and the hover label. SVGs in `icon` are sized to fit.',
    },
    { name: 'desktopClassName', type: 'string', description: 'Classes for the magnifying dock shown in wide spaces.' },
    { name: 'mobileClassName', type: 'string', description: 'Classes for the menu button shown in narrow spaces.' },
    {
      name: 'className',
      type: 'string',
      description: 'Classes for the full-width wrapper. Position this one to pin the dock, e.g. `fixed inset-x-0 bottom-6`.',
    },
  ],
  prompt: `Magnification: the dock keeps the pointer's clientX in a MotionValue (Infinity on mouseleave, never set under reduced motion). Each icon derives its distance from its own centre with useTransform(pointerX, x => x − rect.x − rect.width / 2), reading getBoundingClientRect from a ref. That distance maps through useTransform([-150, 0, 150] → [40, 80, 40]) for the circle's width and height, and [20, 40, 20] for the glyph. Both go through useSpring({ mass: 0.1, stiffness: 150, damping: 12 }). The dock is h-16 with items-end and pb-3, so icons grow upward out of it.

Layout: the root is a full-width @container. The magnifying dock is hidden @xl:flex and the menu button is @xl:hidden, so the switch happens at a 36rem container, not a viewport breakpoint. Position the root (not the inner dock) to fix it to the screen.

Narrow menu: a size-10 round button toggles a nav absolutely positioned above it (bottom-full, mb-2), with items in a flex column. AnimatePresence brings items in with opacity 0 → 1 and y 10 → 0, delayed (count − 1 − index) × 0.05s so the bottom one comes first. They exit with an index × 0.05s delay.

Look: solid fills only, no transparency. Each layer steps one tone away from the page. The tray is rounded-2xl bg-card, the icon circles rounded-full bg-muted (as are the narrow menu's button and items), and the glyphs are text-muted-foreground turning text-foreground on hover. The label is a bg-foreground / text-background pill (text-xs, px-2.5 py-1) at -top-8, centred with x: -50%, sliding up from y 10 as it fades in. It shows on mouseenter and on focus only when the link matches :focus-visible.`,
  preview: { height: 600 },
});
