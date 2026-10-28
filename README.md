# Reacteca

A personal library of React components, built on **shadcn/ui** and **Tailwind CSS v4**, with a monochrome look modelled on [mobbin.com](https://mobbin.com), a single cyan accent from the shadcnblocks celestial theme, and framer-motion animations, in light and dark mode. Every component gets its own page where you can **preview it live**, **copy its source code**, or **copy an AI-ready prompt** that recreates it in any project.

The library starts empty. Drop a folder into `src/library` and it shows up in search, the category pages and the home page automatically.

## Features

- **Three views per component**
  - **Preview**: the live component, with desktop / tablet / mobile widths, grid / dots / plain backgrounds, a light/dark toggle that only affects the canvas, reload, and a standalone full-page preview.
  - **Code**: every source file with syntax highlighting, a usage example, copy / copy all / download, and install commands for shadcn/ui components and npm packages (npm, pnpm, yarn or bun).
  - **Prompt**: a structured prompt for Claude, ChatGPT, Cursor or v0. You can include the source or send the spec only, and pick TypeScript or JavaScript, React or Next.js, and the original styling, Tailwind or CSS Modules. A token estimate is shown.
- **Built on shadcn/ui**: Command palette, Sheet (mobile menu), Tabs, Toggle Group, Select, Dropdown Menu, Tooltip, Table, Breadcrumb, Card, Badge, Empty, Kbd and more.
- **Zero-config registry**: components are discovered with `import.meta.glob`. Metadata loads eagerly. Demos and source are code-split and only load when a component is viewed.
- **Light, dark and system themes**: applied before first paint (no flash), with a View Transitions cross-fade.
- **Command palette**: <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> or <kbd>/</kbd>.
- **Accessible by default**: Radix primitives, a skip link, visible focus rings, `prefers-reduced-motion` support.
- **Scaffolding script**: `npm run new` generates a typed component folder in one command.

## Quick start

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

Open http://localhost:5173.

| Script              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the dev server with hot reload           |
| `npm run build`     | Type-check and build for production (`dist/`)  |
| `npm run preview`   | Serve the production build locally             |
| `npm run typecheck` | Type-check only                                |
| `npm run lint`      | Lint with oxlint (skips generated shadcn files)|
| `npm run new`       | Scaffold a new component (see below)           |

## Adding a component

### 1. Scaffold it

```bash
npm run new -- "Pill Button" --category buttons
# options: -d "One-sentence description"   -s new|beta|stable|deprecated
```

This creates:

```
src/library/pill-button/          # folder name = URL slug → /components/pill-button
├── meta.ts                       # required: what the component is
├── demo.tsx                      # default export rendered in the Preview tab
├── thumbnail.tsx                 # optional: a 600×450 scene shown in library tiles instead of the demo
└── PillButton.tsx                # the component (any extra source file is shown in the Code tab)
```

### 2. Build it with Tailwind and shadcn/ui

```tsx
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PillButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button className={cn('rounded-full px-5', className)} {...props} />;
}
```

Need a primitive that isn't installed yet? `npx shadcn@latest add <name>`.

### 3. Describe it in `meta.ts`

```ts
import { defineComponent } from '@/registry/define';

export default defineComponent({
  name: 'Pill Button',
  description: 'A fully rounded call-to-action button with a soft tonal hover.',
  category: 'buttons',
  tags: ['cta', 'rounded'],
  status: 'new',
  addedAt: '2026-10-28',
  registryDependencies: ['button'],
  dependencies: [],
  features: ['Fully rounded, with extra horizontal padding', 'Supports every Button variant and size'],
  props: [
    { name: 'size', type: "'sm' | 'default' | 'lg'", default: "'default'", description: 'Button size.' },
  ],
  prompt: 'Separate it from its surroundings with color contrast only: no borders, no gradients.',
});
```

| Field                  | Required | Purpose                                                                  |
| ---------------------- | :------: | ------------------------------------------------------------------------ |
| `name`                 |    ✓     | Display name                                                             |
| `description`          |    ✓     | One or two sentences: what it is and when to use it                      |
| `category`             |    ✓     | An id from `src/registry/categories.ts` (type-checked)                   |
| `tags`                 |          | Search keywords                                                          |
| `status`               |          | `new` · `beta` · `stable` (default) · `deprecated`                       |
| `addedAt`              |          | `YYYY-MM-DD`; orders "Recently added"                                    |
| `registryDependencies` |          | shadcn/ui components it builds on; drives `npx shadcn add` and the prompt |
| `dependencies`         |          | npm packages; drives the install command and the prompt                  |
| `features`             |          | Key behaviours; shown on the page and used as prompt requirements        |
| `props`                |          | API reference table; also included in the prompt                         |
| `prompt`               |          | Extra implementation notes appended to the generated prompt              |
| `files`                |          | Which source files the Code tab shows, in order (default: all)           |
| `preview`              |          | `{ layout: 'centered' \| 'padded' \| 'fullscreen', height, background }`  |

The richer the metadata, the better the generated prompt.

### 4. Conventions

- **Self-contained.** Only import from the component's own folder, React, shadcn/ui primitives (`@/components/ui/*`, listed in `registryDependencies`), `cn` from `@/lib/utils`, or packages listed in `dependencies`. Copied code and prompts then work in any shadcn/ui project.
- **Theme tokens, not hex codes.** Use `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-primary`… so components follow light and dark mode, and whatever theme the person copying them uses.
- **No borders, no gradients.** See [Design rules](#design-rules).
- **Drafts.** Prefix a folder with `_` (e.g. `_pill-button`) and the registry ignores it.

## How it works

```
src/library/*/meta.ts    ──eager──▶  registry  ──▶  nav, search, pages, prompt
src/library/*/demo.tsx   ──lazy───▶  Preview tab (React.lazy + Suspense + error boundary)
src/library/*/thumbnail.tsx ─lazy─▶  library tiles, in place of the demo (optional)
src/library/*/*.{tsx,css,…}?raw ─lazy─▶  Code tab and "With source" prompts
```

- `src/registry/registry.ts` discovers components, applies defaults, orders them (by category, then name), and exposes queries such as `getComponent`, `getCategorySummaries` and `getAdjacentComponents`, plus lazy loaders (`getDemo`, `getThumbnail`, `loadSource`).
- `src/registry/prompt.ts` turns a component's metadata (and optionally its source) into a markdown prompt, including the shadcn/ui components it needs. Edit it to change the prompt's structure or wording.
- `src/registry/search.ts` ranks matches by name, tags, category and description. The command palette uses cmdk's fuzzy matching.
- A demo that crashes is caught by an error boundary and never takes the page down.

## Project structure

```
├── .claude/skills/add-component/SKILL.md   # AI agent instructions for adding components
├── components.json                         # shadcn/ui config (style radix-vega, @shadcnblocks registry)
├── public/favicon.svg
├── scripts/new-component.mjs               # npm run new
└── src/
    ├── components/
    │   ├── ui/            # shadcn/ui components (generated by the shadcn CLI)
    │   ├── code/          # CodeBlock, CodePanel, InstallCommand, Prism theme
    │   ├── layout/        # AppLayout, SiteHeader, MobileNav, Footer
    │   ├── preview/       # PreviewPanel, DemoRenderer, thumbnails, error boundary
    │   ├── prompt/        # PromptPanel (prompt builder UI)
    │   ├── search/        # Command palette
    │   └── …              # CopyButton, IconButton, SegmentedControl, StatusBadge, cards
    ├── config/site.ts     # name, tagline, author, links
    ├── hooks/             # useCopy, useLocalStorage, useInView, use-mobile…
    ├── index.css          # Tailwind, the theme, syntax colors, canvas patterns
    ├── library/           # ← your components live here
    ├── pages/             # Home, Components, Component, Getting started, Preview, 404 (code-split)
    ├── registry/          # discovery, categories, types, search, prompt builder
    └── theme/             # ThemeProvider + useTheme (toggles the .dark class)
```

## Design rules

**No borders. No gradients. Only color contrast.** This applies to the app and to every component in the library, and is also written into `CLAUDE.md` so AI agents follow it.

- No `border*`, `divide-*`, ring-style outlines, separators or hairline dividers. No `bg-linear-*` / `bg-radial-*`, gradient stops, SVG gradients, glows or shadows.
- Surfaces are told apart by tone. `src/index.css` defines steps derived from the theme (the background mixed with a little of the foreground), so they hold in light, dark and any future theme:

  | Layer | Classes | Used for |
  | --- | --- | --- |
  | page | `bg-background` | app canvas |
  | 1 | `bg-card` = `bg-surface-1` | frames, tiles, code blocks |
  | 2 | `bg-muted` = `bg-surface-2` | controls, tracks, inputs, menus |
  | 3 | `bg-surface-3` | hover / pressed |
  | highlight | `bg-primary`, `bg-accent`, `bg-foreground text-background` | primary actions, selected, featured |

- Group with spacing, not lines. A selected chip on a track is `bg-background`.
- The shadcn/ui components in `src/components/ui` were edited to match: borders, ring outlines, shadows and separator lines removed; inputs, selects and outline buttons are tonal fills. Do the same for any component added later with `npx shadcn add`.
- Exceptions: keyboard focus rings stay (accessibility), and the preview-canvas grid/dot patterns (drawn with hard-stop CSS gradients, so they show as lines and dots) remain available as canvas backgrounds.

### Style direction: mobbin.com

The look is modelled on [mobbin.com](https://mobbin.com), in both light and dark mode:

- **Monochrome + one accent:** white canvas, near-black ink and soft grays; dark mode is the inversion. Celestial's cyan is the only hue: primary actions, "New" badges, highlights, focus rings and the React-atom logo.
- **Motion:** framer-motion powers page transitions, the hero entrance, scroll reveals, sliding tab indicators, hover lifts and the animated component grid, and respects reduced-motion settings.
- **Pills and big, tight type:** buttons, inputs, selects, tabs and badges are fully rounded. Headings use Inter Tight, bold, with negative letter-spacing.
- **Frames:** content sits in gray frames holding white panels. Library items are large gray rounded thumbnails with the name underneath.
- **Layout:** top navigation with a pill search (no sidebar), generous whitespace, and a dark footer under the rounded page.

`CLAUDE.md` lists the exact classes for each of these, so future changes stay consistent.

## Theme

Everything lives in `src/index.css`:

1. **Theme blocks.** `:root, .light` and `.dark` hold the monochrome palette with the cyan accent, radius and fonts (Inter Tight and JetBrains Mono, self-hosted via Fontsource). The `.light` selector, plus a `dark:` variant that ignores anything inside `.light`, lets the preview canvas show a light component on a dark page and the other way round.
2. **App additions** follow: the surface steps, footer tokens, `primary-strong` (the text-safe accent: deep cyan in light mode, where plain cyan is only 1.8:1 on white, and cyan in dark) and syntax-highlighting colors tuned to the cyan / green / amber / rose palette.
3. **Canvas patterns** are `canvas-grid` / `canvas-dots`. Custom utilities avoid the `bg-` prefix on purpose: `cn()` (tailwind-merge) would treat them as background colors and drop the real one.

**Switching themes:** run `npx shadcn add @shadcnblocks/theme/<name>`. Because the light block's selector is `:root, .light`, the CLI appends a new `:root` block instead of replacing it. Move the new values into `:root, .light` and `.dark`, delete the appended block, and keep the app additions.

## Customization

| What                                   | Where                                    |
| -------------------------------------- | ---------------------------------------- |
| Name, tagline, author, GitHub          | `src/config/site.ts`                     |
| Categories (ids, icons, order)         | `src/registry/categories.ts`             |
| Theme colors, radius, shadows, fonts   | `src/index.css`                          |
| Prompt structure and wording           | `src/registry/prompt.ts`                 |
| shadcn/ui components                   | `npx shadcn@latest add <name>`, edit in `src/components/ui` |
| Logo                                   | `src/components/brand/Logo.tsx` and `public/favicon.svg` |

Set `links.github` in `site.ts` to show a GitHub button in the header.

## Deployment

`npm run build` outputs a static site to `dist/`. The app uses client-side routing, so configure your host to serve `index.html` for unknown paths:

- **Vercel**: add `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`
- **Netlify**: add `public/_redirects` containing `/* /index.html 200`
- **GitHub Pages**: copy `dist/index.html` to `dist/404.html` after building, and set `base` in `vite.config.ts` if you deploy under a sub-path.

## Using an AI agent

`.claude/skills/add-component/SKILL.md` teaches Claude Code (or any agent that reads skills) how to add a component the right way: scaffold, build with Tailwind and shadcn/ui, fill in the metadata, and verify with type-check, lint and build. In Claude Code, ask something like *"add a pricing card component"* and the skill is picked up automatically.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui (Radix) · Mobbin-inspired theme with celestial accent · framer-motion · React Router · cmdk · prism-react-renderer · lucide-react · Inter Tight & JetBrains Mono (Fontsource) · oxlint

---

© Andrada Paraczki
