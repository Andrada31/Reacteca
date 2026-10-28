import { defineComponent } from '@/registry/define';

export default defineComponent({
  name: 'Dock',
  description:
    'A floating navigation dock of icon buttons. Drag its handle to resize it, hide it with the close button and bring it back from the menu button.',
  category: 'navigation',
  tags: ['dock', 'navigation', 'icons', 'resize', 'framer-motion'],
  status: 'new',
  addedAt: '2026-10-28',
  inspiration: [
    { label: 'The Design Office of David McGillivray', href: 'https://dmcg.co' },
    { label: 'Infinite Machine case study', href: 'https://dmcg.co/work/infinitemachine' },
  ],
  registryDependencies: ['button', 'tooltip'],
  dependencies: ['framer-motion', 'lucide-react', 'radix-ui'],
  features: [
    'Dragging the handle on the right edge resizes the whole dock: right to grow, left to shrink, with the handle staying under the pointer. Past minScale or maxScale it rubber-bands, giving a little with growing resistance (half as much when shrinking).',
    'Letting go acts like an elastic band: the dock carries on a little in the direction it was resized, springs back and settles with a small wobble (subtler after shrinking). Let go while stretched past a limit, it snaps back. With the keyboard the kick comes when the resizing key is released.',
    'The handle is a keyboard-operable slider: arrow keys step 5%, Page Up/Down 20%, Home/End jump to the limits.',
    'Hovering an item makes its icon grow with a springy overshoot and shows a pill tooltip under the dock (label plus an optional muted hint, no arrow).',
    'Moving through the items, with the pointer or with Tab, plays a short, dry click for each one, like the default keyboard sound on a phone (once the page has had a click or key press, as browsers require). Turn it off with sound={false}.',
    'The close button pops bigger on hover; pressing it hides the dock: items leave outside-in while the tray folds into a round menu button.',
    'The menu button brings it back: the circle unfurls into the tray, items pop in from the middle outwards and the close button spins in.',
    'Focus moves to the menu button after closing and to the close button after opening.',
    'The active item is a raised chip marked aria-current="page"; items can be buttons or links.',
    'Never overflows: in a container narrower than the dock it scales down to fit, and grows back when there is room.',
    'Respects reduced motion: no scaling, rotation, rubber-banding or springs, only fades.',
  ],
  props: [
    {
      name: 'items',
      type: 'DockItem[]',
      required: true,
      description:
        'Icons to show: `{ id, label, hint?, icon, href?, onSelect? }`. `hint` is muted text after the label in the tooltip. SVGs in `icon` are sized to fit the tile.',
    },
    { name: 'activeId', type: 'string', description: 'The current item, shown as a raised chip and marked aria-current.' },
    { name: 'open', type: 'boolean', description: 'Controlled visibility.' },
    { name: 'defaultOpen', type: 'boolean', default: 'true', description: 'Initial visibility when uncontrolled.' },
    { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when the close or menu button is used.' },
    { name: 'scale', type: 'number', description: 'Controlled size multiplier.' },
    { name: 'defaultScale', type: 'number', default: '1', description: 'Initial size multiplier when uncontrolled.' },
    { name: 'minScale', type: 'number', default: '0.6', description: 'Smallest size the handle can reach.' },
    { name: 'maxScale', type: 'number', default: '1.6', description: 'Largest size the handle can reach.' },
    { name: 'onScaleChange', type: '(scale: number) => void', description: 'Called while resizing.' },
    { name: 'tooltipSide', type: "'top' | 'bottom'", default: "'bottom'", description: 'Where item tooltips appear.' },
    {
      name: 'sound',
      type: 'boolean',
      default: 'true',
      description: 'Plays a short keyboard click, like a phone keyboard, as the pointer or keyboard focus moves onto each item.',
    },
    { name: 'className', type: 'string', description: 'Classes for the full-width wrapper that centres the dock.' },
  ],
  prompt: `Scaling: every size inside the dock uses Tailwind spacing utilities (h-16, size-11, size-9, [&_svg]:size-5.5, rounded-[--spacing(6)]…), so setting Tailwind v4's base unit on the dock, style={{ '--spacing': \`\${0.25 * scale}rem\` }}, scales everything at once without transforms. The dock is centred and grows about its centre, so while dragging set scale = startScale × (pointerX − dockCentreX) / (startPointerX − dockCentreX), which keeps the handle under the pointer. Use pointer capture on the handle. To fit narrow containers, a ResizeObserver on the full-width wrapper and the dock computes fitScale = wrapperWidth / (dockWidth / currentScale) and the dock renders at min(scale, fitScale).

Elastic resize: the on-screen scale is a MotionValue (shown) that drives --spacing through useTransform; the committed scale is React state. While dragging, keep the unclamped raw scale, commit clamp(raw), and set shown to a rubber band of raw: past max, max + 0.05·over / (0.05 + over); past min, min − 0.025·over / (0.025 + over). Record { time, raw } samples (last 160ms). On pointerup after a resize, if raw was inside the limits, animate(shown, target, spring) with a release velocity: sign of the last 80ms velocity (or of the last move if the pointer had stopped) × clamp(0.6·|v|, 0.6, 1.5) scale/s, halved when shrinking. Use spring { stiffness 340, damping 14, mass 0.85, restDelta 0.0007, restSpeed 0.006 }, so it overshoots, springs back and wobbles. If raw was past a limit, spring back from the stretched size with velocity 0. Keyboard steps get the same kick (±0.6, or −0.3) on keyup. A layout effect keeps shown in sync with the committed scale when not dragging, retargeting a running spring so it keeps its speed. Grabbing the handle mid-spring stops it and starts the drag from shown. pointercancel springs back with no kick.

Open/close: AnimatePresence mode="wait" swaps the dock and a round menu button that is exactly as tall as the tray. The tray is clipped with clip-path: inset(0 calc((50% - 1.5u) × c) 0 calc((50% - 14.5u) × c) round calc(u × (6 + 2c))), where u is var(--spacing) and c = 1 − var(--dock-reveal). Animating the CSS variable --dock-reveal from 0 to 1 (0.6s, ease [0.22, 1, 0.36, 1]) unfurls a circle the size of the menu button, centred where the button sat, into the full tray; closing reverses it (0.4s). Items use dynamic variants keyed on their distance from the middle item: in with a spring (bounce 0.45) delayed 0.1s + 0.045s per step, out in 0.18s outside-in.

Items and hover: 44px tiles (22px icons, 4px apart) with muted icons that turn foreground on a bg-foreground/10 tile when hovered; the active one gets a bg-background chip. Each item sets whileHover="hover" / whileTap="tap", and an inner icon span with variants { hover: scale 1.35, tap: scale 1.15 } and a spring (stiffness 520, damping 14) does the growing, so hover-out springs back without the entrance delay. The close button uses the same spring for whileHover scale 1.2, inside a wrapper that carries its spin-in variants. Tooltips use Radix Tooltip Content without an arrow: a rounded-full bg-foreground / text-background pill (hint at text-background/60), sideOffset = 10 × scale + 8 so it clears the tray. Items and the round buttons use cursor-pointer.

Key sound: no audio file. A shared AudioContext, created lazily and only once navigator.userActivation.hasBeenActive (browsers block audio before a click or key press), plays a soft, dry, phone-keyboard click. The body is two fixed sines, 2kHz at gain 0.14 and 1.05kHz at gain 0.1. Each starts at full level and fades with setTargetAtTime(0, now, τ), τ = 6ms and 4ms, stopping after 8τ. On top sits a 3ms noise burst (amplitude (1 − t)²) through a 2kHz highpass at gain 0.07. Everything goes through one shared 4kHz lowpass (softness) and a 0.4 gain (volume). There's no pitch movement (that makes it bubbly) and no random variation: the same click every time. Play it on each item's pointerenter, and on focus only when the item matches :focus-visible, so a click doesn't tick twice.`,
  preview: { height: 340 },
});
