import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { categories, getCategory, type CategoryDefinition } from './categories';
import { detectLanguage, normalizeCode, orderSourceFiles } from './source';
import type { ComponentEntry, ComponentMeta, ComponentSource, SourceFile } from './types';

/*
 * Discovery
 * ---------
 * Every folder in src/library is a component, except folders starting with "_"
 * (use those for drafts). Each folder needs a meta.ts and should have a demo.tsx;
 * every other source file in it is shown in the Code tab.
 *
 * Metadata is loaded eagerly (it's tiny). Demos and raw source are code-split
 * and only fetched when a component is actually viewed.
 */
const metaModules = import.meta.glob<ComponentMeta>(['../library/*/meta.ts', '!../library/_*/**'], {
  eager: true,
  import: 'default',
});

const demoModules = import.meta.glob<{ default: ComponentType }>([
  '../library/*/demo.tsx',
  '!../library/_*/**',
]);

const sourceModules = import.meta.glob<string>(
  ['../library/*/*.{tsx,ts,jsx,js,css,scss}', '!../library/*/meta.ts', '!../library/_*/**'],
  { query: '?raw', import: 'default' },
);

const DEMO_FILE = 'demo.tsx';

function parseLibraryPath(path: string): { slug: string; file: string } | null {
  const match = /\/library\/([^/]+)\/([^/]+)$/.exec(path);
  return match ? { slug: match[1], file: match[2] } : null;
}

const filesBySlug = new Map<string, string[]>();
for (const path of Object.keys(sourceModules)) {
  const parsed = parseLibraryPath(path);
  if (!parsed) continue;
  filesBySlug.set(parsed.slug, [...(filesBySlug.get(parsed.slug) ?? []), parsed.file]);
}

function createEntry(slug: string, meta: ComponentMeta): ComponentEntry {
  if (import.meta.env.DEV && !getCategory(meta.category)) {
    console.warn(`[registry] "${slug}" uses unknown category "${meta.category}".`);
  }
  const { files, ...rest } = meta;
  const available = (filesBySlug.get(slug) ?? []).filter((file) => file !== DEMO_FILE);
  return {
    ...rest,
    slug,
    tags: meta.tags ?? [],
    status: meta.status ?? 'stable',
    dependencies: meta.dependencies ?? [],
    registryDependencies: meta.registryDependencies ?? [],
    features: meta.features ?? [],
    props: meta.props ?? [],
    sourceFiles: orderSourceFiles(available, files),
    hasDemo: `../library/${slug}/${DEMO_FILE}` in demoModules,
  };
}

const categoryOrder = new Map<string, number>(categories.map((category, index) => [category.id, index]));

// Sidebar order: by category, then alphabetically.
const entries: ComponentEntry[] = Object.entries(metaModules)
  .flatMap(([path, meta]) => {
    const parsed = parseLibraryPath(path);
    return parsed ? [createEntry(parsed.slug, meta)] : [];
  })
  .sort(
    (a, b) =>
      (categoryOrder.get(a.category) ?? Infinity) - (categoryOrder.get(b.category) ?? Infinity) ||
      a.name.localeCompare(b.name),
  );

const entriesBySlug = new Map(entries.map((entry) => [entry.slug, entry]));

/* Queries ------------------------------------------------------------------ */

export const allComponents: readonly ComponentEntry[] = entries;

export function getComponent(slug: string): ComponentEntry | undefined {
  return entriesBySlug.get(slug);
}

export function getComponentsByCategory(categoryId: string): ComponentEntry[] {
  return entries.filter((entry) => entry.category === categoryId);
}

export interface CategorySummary extends CategoryDefinition {
  count: number;
}

/** Every category with its component count, in display order. */
export function getCategorySummaries(): CategorySummary[] {
  return categories.map((category) => ({
    ...category,
    count: entries.filter((entry) => entry.category === category.id).length,
  }));
}

/** Most recently added first. Components without `addedAt` go last. */
export function getRecentComponents(limit = 6): ComponentEntry[] {
  return [...entries]
    .sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? '') || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function getAdjacentComponents(slug: string): {
  previous: ComponentEntry | null;
  next: ComponentEntry | null;
} {
  const index = entries.findIndex((entry) => entry.slug === slug);
  return {
    previous: index > 0 ? entries[index - 1] : null,
    next: index >= 0 && index < entries.length - 1 ? entries[index + 1] : null,
  };
}

/* Lazy demos & source ------------------------------------------------------ */

const demoCache = new Map<string, LazyExoticComponent<ComponentType>>();

/** The component's demo as a lazy component (render inside <Suspense>), or null. */
export function getDemo(slug: string): LazyExoticComponent<ComponentType> | null {
  const load = demoModules[`../library/${slug}/${DEMO_FILE}`];
  if (!load) return null;
  let demo = demoCache.get(slug);
  if (!demo) {
    demo = lazy(load);
    demoCache.set(slug, demo);
  }
  return demo;
}

const sourceCache = new Map<string, Promise<ComponentSource>>();

/** Loads a component's source files. Cached, so it's safe to pass to `use()`. */
export function loadSource(slug: string): Promise<ComponentSource> {
  let promise = sourceCache.get(slug);
  if (!promise) {
    promise = readSource(slug);
    sourceCache.set(slug, promise);
  }
  return promise;
}

async function readFile(slug: string, name: string): Promise<SourceFile | null> {
  const load = sourceModules[`../library/${slug}/${name}`];
  if (!load) return null;
  return { name, language: detectLanguage(name), code: normalizeCode(await load()) };
}

async function readSource(slug: string): Promise<ComponentSource> {
  const names = getComponent(slug)?.sourceFiles ?? [];
  const [files, usage] = await Promise.all([
    Promise.all(names.map((name) => readFile(slug, name))),
    readFile(slug, DEMO_FILE),
  ]);
  return { files: files.filter((file): file is SourceFile => file !== null), usage };
}

// Edited files should show up in the Code tab without a full reload.
if (import.meta.hot) {
  import.meta.hot.on('vite:afterUpdate', () => sourceCache.clear());
}
