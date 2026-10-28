# Reacteca

Personal React component library: React 19 + Vite + TypeScript, Tailwind CSS v4, shadcn/ui (`src/components/ui`, style radix-vega), framer-motion. Monochrome look modelled on mobbin.com with celestial's cyan as the single accent, in light and dark. Components live in `src/library/<slug>/`; follow `.claude/skills/add-component/SKILL.md` to add one.

Verify every change with `npm run typecheck && npm run lint && npm run build`.

## Design rules (apply to every style change)

### 1. No borders. No gradients. Only color contrast.

This is a hard rule from the owner.

- Never add `border*`, `divide-*`, `outline`/`ring-1`-style edges, `<Separator>`, hairline dividers, `bg-linear-*` / `bg-radial-*` / `bg-conic-*`, `from-*` / `via-*` / `to-*` stops, SVG gradients, glows, or shadows (all `shadow-*` tokens are zeroed).
- Separate surfaces by **tone**, using the steps defined in `src/index.css` (derived from the theme, so they work in light, dark and any future theme):

  | Layer | Classes | Used for |
  | --- | --- | --- |
  | page | `bg-background` | app canvas, inner panels |
  | 1 | `bg-card` = `bg-surface-1` | frames, tiles, code blocks |
  | 2 | `bg-muted` = `bg-surface-2` | controls, tracks, inputs, menus |
  | 3 | `bg-surface-3` | hover / pressed |
  | highlight | `bg-primary text-primary-foreground`, `bg-accent`, `bg-foreground text-background` | primary actions, selected, featured |

- A control sitting on a surface takes the next step up. A selected "chip" on a track is `bg-background`.
- Group and divide with spacing (gap, padding, margin), never with lines.
- **Exceptions:** keyboard focus rings (`focus-visible:ring-*`, `has-[…:focus-visible]:ring-*`) stay, because accessibility requires them. The preview-canvas patterns (`canvas-grid`, `canvas-dots`) are drawn with hard-stop CSS gradient functions; they render as lines and dots, not color gradients.

### 2. Style direction: mobbin.com

- **Monochrome + one accent.** White canvas, near-black ink (`foreground`), soft grays; dark mode is the inversion. The only hue is celestial's cyan (`primary`, oklch(0.8012 0.1089 201.17), same in both modes), used sparingly: primary actions, "New" badges, selected/featured accents, focus rings, the logo, and one highlighted phrase per headline. As a fill it takes black text (`bg-primary text-primary-foreground`); as text or icons use `text-primary-strong` (deep cyan in light mode, where plain cyan is only 1.8:1 on white).
- **Pills.** Buttons, inputs, selects, segmented tracks, tabs and badges are fully rounded. Primary action = cyan pill (`<Button>`); secondary = gray pill (`variant="secondary"`).
- **Big, tight type.** Inter Tight. Headings are bold or semibold with negative tracking (`tracking-[-0.035em]`, hero `-0.045em`): page titles `text-4xl sm:text-6xl`, section titles `text-3xl`–`text-5xl`. Body copy in `text-muted-foreground`, often `text-lg`.
- **Frames.** Content sits in a gray frame holding a white panel: frame `rounded-[1.75rem] bg-card p-1.5` (hero-sized: `rounded-[2.5rem] p-10`), panel `rounded-[1.375rem] bg-background`. `CodeBlock` with a `title` does this automatically.
- **Tiles.** Library items are large gray rounded thumbnails (`rounded-[1.75rem] bg-card`, 4:3) with the name and category *below*, not inside a card (`ComponentCard`, home page). The Components page instead uses `PreviewCard`: a frame holding a white 4:3 preview panel, with the name and count/description inside the frame under the panel. It has a Grouped view (one card per category) and an All view, and a categories sidebar with counts.
- **Layout.** Top navigation (no sidebar), a pill search, generous whitespace (home sections `gap-28 sm:gap-40`), and a dark footer (`bg-footer`) under the rounded page sheet (`rounded-b-[2.5rem] bg-background`).
- **Signature details:** the React-atom logo (`Logo`, spins on hover), the hero headline "Components, crafted once. / Ready to reuse anywhere." with inline icon tiles (`Tile` in `HomePage.tsx`) and its second line in `text-primary-strong`, big-text link columns in the explore panel, and "New" badges as cyan pills. Reuse these patterns instead of inventing new decoration.

### 3. Motion (framer-motion)

- Use framer-motion for animation; the app root wraps everything in `<MotionConfig reducedMotion="user">`, so the OS "reduce motion" setting is respected automatically. Keep CSS transitions for simple color/hover changes.
- Shared pieces: `Reveal` / `Stagger` / `StaggerItem` in `src/components/motion.tsx` (fade-and-lift on first scroll into view), and `easeOut`, `indicatorSpring`, `staggerItem` in `src/lib/motion.ts`.
- Patterns in use: page fade-up on route change (`AppLayout`), hero lines staggering in, then stretching apart on an elastic spring for spring-popped tiles, sliding selection chips via `layoutId` (view tabs, file tabs, `SegmentedControl`), feature tiles lifting on hover, and `AnimatePresence` + `layout` for filtering the component grid.
- Keep it subtle: ~0.3–0.8s, `easeOut` or springs, small distances (≤ 36px), animate once on reveal. Never animate borders, gradients or shadows into existence (rule 1 still applies).

## Implementation notes

- `src/index.css`: theme blocks (`:root, .light` and `.dark`), then app additions: surface steps, footer tokens, `primary-strong` (the text-safe accent: deep cyan in light mode, cyan in dark), syntax colors, canvas patterns.
- Custom utilities must not start with a Tailwind color prefix (`bg-`, `text-`, …): `cn()` (tailwind-merge) treats them as colors and silently drops the real color class next to them. That's why the patterns are `canvas-grid` / `canvas-dots`.
- `npx shadcn add @shadcnblocks/theme/<name>` appends a second `:root` block because the light selector is `:root, .light`. Merge its values into `:root, .light` / `.dark`, delete the duplicate, and keep the app additions.
- After `npx shadcn add <component>`, strip the new file's `border`, `border-input`, `ring-1 ring-foreground/10`, `shadow-*` and `bg-border` separators; give inputs and outlined controls a tonal fill (`bg-input` / `bg-muted`, hover `bg-surface-3`); and make controls `rounded-full`.
