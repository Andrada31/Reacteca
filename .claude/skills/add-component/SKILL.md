---
name: add-component
description: Add a new React component to the Reacteca component library (src/library). Use when the user asks to add, create, build or port a component, UI element, widget or effect into this library, or to fix up an existing library component's metadata, demo or prompt output.
---

# Add a component to Reacteca

Reacteca is a personal React component library. Every folder in `src/library/` is one component, discovered automatically by `src/registry/registry.ts`. Each one gets a page with three views:

- **Preview** renders `demo.tsx`.
- **Code** shows every other source file in the folder, plus `demo.tsx` as the usage example.
- **Prompt** is generated from `meta.ts`, and optionally the source, by `src/registry/prompt.ts`.

Never edit an index or list to register a component. Discovery is automatic.

## Workflow

### 1. Clarify only what you can't infer

You need a name, a category and a rough behaviour. Pick the category yourself from the ids in `src/registry/categories.ts`: `buttons`, `inputs`, `navigation`, `overlays`, `feedback`, `data-display`, `layout`, `typography`, `media`, `animation`, `backgrounds`. Ask the user only if the request is genuinely ambiguous. If no category fits, propose adding one to `categories.ts` (id, label, description, lucide icon) rather than forcing a bad fit.

### 2. Scaffold

```bash
npm run new -- "Component Name" --category <id> --description "One sentence." [--status new|beta|stable]
```

This creates `src/library/<slug>/` with `meta.ts`, `demo.tsx` and `<Name>.tsx` (a Tailwind starter that uses `cn()`). Check whether the folder already exists first. The script refuses to overwrite.

### 3. Build the component (`<Name>.tsx`)

The app is built on **shadcn/ui + Tailwind CSS v4**, with a monochrome look modelled on mobbin.com plus a single cyan accent (see `CLAUDE.md`). Hard rules. These are what make the copied code and the generated prompt work in other projects:

- **Self-contained.** Import only from files inside the component's own folder, `react`, shadcn/ui primitives in `@/components/ui/*`, `cn` from `@/lib/utils`, or npm packages you list in `meta.dependencies`. Never import app internals (`@/components/<anything but ui>`, `@/hooks`, `@/registry`, `@/config`…).
- **Reuse shadcn/ui.** Build on existing primitives (`button`, `card`, `badge`, `dialog`, `tooltip`, …) instead of re-creating them, and list every one you import in `meta.registryDependencies`. If one isn't installed (check `src/components/ui/`), add it with `npx shadcn@latest add <name>`. Don't edit files in `src/components/ui/` for a single component; wrap them instead.
- **Named export** for the component and its props type (`export function PillButton`, `export type PillButtonProps` or `export interface PillButtonProps`). Only `demo.tsx` uses a default export.
- **TypeScript, strict.** Extend the underlying element's or primitive's props (`ComponentProps<'div'>`, `ComponentProps<typeof Button>`), spread the rest onto the root, and merge `className` with `cn()`.
- **No borders, no gradients: only color contrast.** This is the owner's hard design rule (see `CLAUDE.md`). Never use `border*`, `divide-*`, ring-style outlines, `<Separator>`, gradient utilities or stops, SVG gradients, glows or colored shadows. Separate surfaces by tone: `bg-background` → `bg-card` → `bg-muted` (and `bg-accent` / `bg-primary/15` for highlights), and group with spacing. Focus rings are the only exception.
- **Styling: Tailwind utilities with theme tokens.** Use `bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `bg-chart-1`…`bg-chart-5`, and opacity modifiers (`bg-primary/10`). Never hard-code hex colors. The tokens switch between light and dark automatically, and also adopt the theme of whoever copies the component. Reach for `dark:` only for genuine exceptions. Match the house style: monochrome with cyan `primary` as the one accent (as a fill with `text-primary-foreground`; don't use `text-primary` for small text on white, it's only 1.8:1), fully rounded controls (`rounded-full`), big tight headings (`tracking-tight` or tighter), and gray frames (`bg-card`) around white panels (`bg-background`). Don't use the app-only `primary-strong` token in library components: it isn't part of shadcn/ui, so copied code would break.
- **Both themes.** Check the component in light and dark. The preview canvas can show either one regardless of the site theme.
- **Accessible.** Use semantic elements, full keyboard support, visible focus styles (`focus-visible:ring-3 focus-visible:ring-ring/50`, like shadcn) and correct ARIA attributes. Prefer Radix-based primitives for anything interactive.
- **Motion.** `framer-motion` is installed for real animation (`import { motion, useReducedMotion } from 'framer-motion'`); list it in `meta.dependencies` when you use it. For simple enter/exit effects, `tw-animate-css` classes (`animate-in`, `fade-in`, …) are enough. Always respect reduced motion (`useReducedMotion()` or the `motion-safe:` / `motion-reduce:` variants).
- **No npm dependencies unless they earn it.** If you add one, `npm install` it and list it in `meta.dependencies`.
- More files are fine (subcomponents, a hook, helpers, a stylesheet). They all appear in the Code tab, ordered `.tsx` then `.ts` then `.css`. Use `meta.files` to choose or reorder them.

### 4. Write `demo.tsx`

- `export default function Demo()` renders a realistic, attractive example. It is both the live preview and the usage example people copy, so keep it short and idiomatic.
- It may show a few variants side by side (wrap them in a flex container with a gap) and may hold local state for interactive demos.
- If the component needs a different canvas, set `meta.preview`: `layout: 'padded'` for wide content, `'fullscreen'` for page sections or backgrounds, plus `height` (default 420) and `background` (`grid` | `dots` | `plain`).

### 4b. Check the thumbnail, add `thumbnail.tsx` if it doesn't read

Library tiles (home page, Components page) render the demo on a fixed 600×450 stage, laid out like the Preview canvas, then scale it down to the tile (about 0.45×) and crop whatever overflows. Look at the component's tile in both themes. If the demo is too tall, too sparse, or only shows its behaviour on interaction, add a `thumbnail.tsx` to the folder: a default-exported scene that fills the 600×450 stage and is shown in tiles instead of the demo. It never appears in the Code tab or the prompt.

- Tiles are `inert` and ignore the pointer, so the scene drives the component itself. It receives `active` (`ThumbnailProps`): true while the tile is hovered or keyboard-focused, and on touch screens once it's in view. At rest, show a clean starting state; while `active`, play the behaviour (e.g. `floating-dock` glides synthetic mouse events along the dock, `scroll-timeline` scrolls its own container, `spotlight-carousel` steps its controlled `index`); when it turns false, return to rest, starting from wherever it got to. Under reduced motion, jump between the two states.
- On the home page's gray tiles the surface tokens are shifted up a step (`on-surface-1` in `src/index.css`), so keep using `bg-background` / `bg-card` / `bg-muted` as usual.

### 5. Fill in `meta.ts` completely

This drives the page, search, the API table and the AI prompt, so be thorough:

- `description`: one or two sentences, what it is and when to use it. No marketing fluff.
- `tags`: 2 to 5 lowercase search keywords.
- `features`: the 3 to 6 behaviours that define it. These become the prompt's requirements, so write them as testable statements ("Closes on Escape and outside click", not "Great UX").
- `props`: one entry per public prop: `name`, `type` (TypeScript syntax as a string), `default` (as code, e.g. `"'md'"`), `required`, `description`. Keep it in sync with the actual props type.
- `prompt`: the implementation details someone would need to recreate it without the source (technique, key CSS trick, timing values). Leave it out if nothing is non-obvious.
- `inspiration`: if the component is based on someone else's design or site, credit it: `[{ label, href }]`, one entry per studio, site or page, each with a direct link. They show as "Inspired by" links at the top of the component's page. Also name them in a comment at the top of the main source file, so the credit travels with copied code. Never leave this out when the user names a reference.
- `registryDependencies`: every shadcn/ui component imported from `@/components/ui/*` (file name without extension, e.g. `'dropdown-menu'`).
- `dependencies`, `status`, and `addedAt` (today, `YYYY-MM-DD`).

### 6. Verify

Run all three and fix anything they report:

```bash
npm run typecheck
npm run lint
npm run build
```

If a dev server is available, open `/components/<slug>` and check all three tabs: the preview renders in both themes and at the mobile width, the Code tab lists the right files, and the Prompt tab reads well with both "With source" and "Spec only".

A dev server that was already running doesn't generate Tailwind classes that appear only in files created after it started, so a new component can render collapsed or unstyled there even though the build is fine. Touch `src/index.css` (or restart `npm run dev`) to make Tailwind rescan.

## Don't

- Don't edit `src/registry/registry.ts` or any page to register a component.
- Don't import app internals from inside `src/library/`. The only allowed `@/` imports are `@/components/ui/*`, `@/lib/utils`, and, in `meta.ts` only, `defineComponent` from `@/registry/define` (never from `@/registry`, which would create an import cycle).
- Don't hard-code colors or add CSS Modules when Tailwind utilities with theme tokens can do the job.
- Don't add borders, dividers, outlines, gradients or glows. Use color contrast.
- Don't leave TODOs, placeholder text or the scaffold's default description in a finished component.
- Don't name a folder starting with `_` unless the component is meant to stay a hidden draft.
