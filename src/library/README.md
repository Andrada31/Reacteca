# Component library

Every folder here is one component. The registry (`src/registry/registry.ts`) finds them automatically, so you never edit an index file.

```
src/library/
└── pill-button/          # folder name = URL slug (/components/pill-button)
    ├── meta.ts           # required: name, description, category, props…
    ├── demo.tsx          # default export rendered in the Preview tab
    ├── thumbnail.tsx     # optional: a 600×450 scene shown in library tiles instead of the demo
    └── PillButton.tsx    # the component; every other source file appears in the Code tab
```

- Create one with `npm run new -- "Pill Button" --category buttons`.
- Style with Tailwind CSS and the shadcn/ui theme tokens (`bg-card`, `bg-muted`, `text-muted-foreground`, `bg-primary`…) so components follow light and dark mode.
- **No borders, no gradients.** Separate surfaces by color contrast only (see `CLAUDE.md`).
- Folders starting with `_` are ignored. Use them for drafts.
- Keep components self-contained. Only import from inside the folder, from React, from shadcn/ui primitives (`@/components/ui/*`, listed in `registryDependencies`), from `cn` in `@/lib/utils`, or from packages listed in `dependencies`. That's what makes the copied code and the generated prompt work in someone else's shadcn/ui project.

See the Getting started page in the app, or the root `README.md`, for the full `meta.ts` reference.
