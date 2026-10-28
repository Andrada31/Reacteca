import type { CategoryId } from './categories';

export type ComponentStatus = 'new' | 'beta' | 'stable' | 'deprecated';

/** One row of a component's API reference. */
export interface PropDoc {
  name: string;
  /** TypeScript type, e.g. `'sm' | 'md' | 'lg'`. */
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export interface PreviewOptions {
  /** How the demo sits in the preview canvas. Defaults to `centered`. */
  layout?: 'centered' | 'padded' | 'fullscreen';
  /** Minimum canvas height in pixels. Defaults to 420. */
  height?: number;
  /** Default canvas background. Defaults to `grid`. */
  background?: PreviewBackground;
}

export type PreviewBackground = 'grid' | 'dots' | 'plain';

/** Someone else's work a component is based on, credited with a link on its page. */
export interface Credit {
  /** Who or what, e.g. "The Design Office of David McGillivray". */
  label: string;
  href: string;
}

/**
 * What a component's `meta.ts` declares. Everything except name,
 * description and category is optional.
 */
export interface ComponentMeta {
  /** Display name, e.g. "Pill Button". */
  name: string;
  /** One or two sentences: what it is and when to use it. */
  description: string;
  category: CategoryId;
  /** Search keywords shown as tags. */
  tags?: string[];
  /** Defaults to `stable`. */
  status?: ComponentStatus;
  /** ISO date (YYYY-MM-DD). Drives "Recently added" ordering. */
  addedAt?: string;
  /** npm packages the component needs, e.g. `['motion']`. */
  dependencies?: string[];
  /** shadcn/ui components it builds on, e.g. `['button', 'card']` (imported from `@/components/ui/*`). */
  registryDependencies?: string[];
  /** Key behaviours. Shown on the page and used as prompt requirements. */
  features?: string[];
  /** API reference. Shown on the page and included in the prompt. */
  props?: PropDoc[];
  /** Designs or sites the component is based on. Shown at the top of its page as "Inspired by" links. */
  inspiration?: Credit[];
  /** Extra implementation notes appended to the generated AI prompt. */
  prompt?: string;
  /**
   * Source files to show in the Code tab, in order.
   * Defaults to every source file in the folder except meta.ts and demo.tsx.
   */
  files?: string[];
  preview?: PreviewOptions;
}

/** A registered component: its meta with defaults applied, plus derived data. */
export interface ComponentEntry
  extends Omit<
    ComponentMeta,
    'tags' | 'status' | 'dependencies' | 'registryDependencies' | 'features' | 'props' | 'inspiration' | 'files'
  > {
  slug: string;
  tags: string[];
  status: ComponentStatus;
  dependencies: string[];
  registryDependencies: string[];
  features: string[];
  props: PropDoc[];
  inspiration: Credit[];
  /** File names shown in the Code tab, in display order. */
  sourceFiles: string[];
  hasDemo: boolean;
}

export type CodeLanguage = 'tsx' | 'ts' | 'jsx' | 'js' | 'css' | 'json' | 'markdown' | 'bash' | 'plain';

export interface SourceFile {
  name: string;
  language: CodeLanguage;
  code: string;
}

export interface ComponentSource {
  files: SourceFile[];
  /** The demo file, shown as a usage example. */
  usage: SourceFile | null;
}
