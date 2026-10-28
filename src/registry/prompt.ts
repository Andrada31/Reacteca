import type { ComponentEntry, ComponentSource, PropDoc, SourceFile } from './types';

export type PromptMode = 'source' | 'spec';
export type PromptLanguage = 'typescript' | 'javascript';
export type PromptFramework = 'react' | 'nextjs';
export type PromptStyling = 'original' | 'tailwind' | 'css-modules';

export interface PromptOptions {
  /** `source` embeds the reference code; `spec` describes the component only. */
  mode: PromptMode;
  language: PromptLanguage;
  framework: PromptFramework;
  styling: PromptStyling;
}

export const defaultPromptOptions: PromptOptions = {
  mode: 'source',
  language: 'typescript',
  framework: 'react',
  styling: 'original',
};

/** Rough token count (~4 characters per token) for display. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const fenceLanguage: Partial<Record<SourceFile['language'], string>> = {
  tsx: 'tsx',
  ts: 'ts',
  jsx: 'jsx',
  js: 'js',
  css: 'css',
  json: 'json',
};

/** Wraps code in a fence that's longer than any backtick run inside it. */
function codeFence(file: SourceFile): string {
  const longestRun = Math.max(2, ...(file.code.match(/`+/g) ?? []).map((run) => run.length));
  const fence = '`'.repeat(longestRun + 1);
  return `${fence}${fenceLanguage[file.language] ?? ''}\n${file.code}\n${fence}`;
}

function section(title: string, body: string): string {
  return `## ${title}\n\n${body}`;
}

function bullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function formatProp(prop: PropDoc): string {
  const details = [`\`${prop.type}\``];
  if (prop.required) details.push('required');
  if (prop.default !== undefined) details.push(`default \`${prop.default}\``);
  return `- \`${prop.name}\` (${details.join(', ')}): ${prop.description}`;
}

function describeAuthoredStyling(files: string[]): string {
  if (files.some((file) => /\.module\.s?css$/.test(file))) return 'CSS Modules';
  if (files.some((file) => /\.s?css$/.test(file))) return 'a plain CSS stylesheet';
  return 'Tailwind CSS utility classes with shadcn/ui theme tokens';
}

const tokenNote =
  'Use shadcn/ui theme tokens (`bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-primary`, …) instead of hard-coded colors, so light and dark mode follow my theme.';

function stylingInstructions(entry: ComponentEntry, options: PromptOptions, withSource: boolean): string {
  const themeNote = 'Drive colors with CSS custom properties so it adapts to light and dark themes.';
  const authoredWithTailwind = !entry.sourceFiles.some((file) => /\.s?css$/.test(file));
  switch (options.styling) {
    case 'tailwind':
      return [
        'Style it with Tailwind CSS utility classes only, with no separate stylesheet.',
        withSource && !authoredWithTailwind ? 'Translate the reference CSS into equivalent utilities, keeping the same look.' : '',
        tokenNote,
      ]
        .filter(Boolean)
        .join(' ');
    case 'css-modules':
      return [
        'Style it with CSS Modules (`*.module.css`).',
        withSource ? 'Convert the reference styles if they use another approach, keeping the same look.' : '',
        themeNote,
      ]
        .filter(Boolean)
        .join(' ');
    case 'original':
      if (authoredWithTailwind) {
        return withSource
          ? `Keep the Tailwind CSS classes from the reference implementation. ${tokenNote}`
          : `Style it with Tailwind CSS utility classes. ${tokenNote}`;
      }
      return withSource
        ? `Keep the styling approach of the reference implementation (${describeAuthoredStyling(entry.sourceFiles)}).`
        : `Style it with ${describeAuthoredStyling(entry.sourceFiles)}. ${themeNote}`;
  }
}

function stackNotes(
  entry: ComponentEntry,
  source: ComponentSource | null,
  options: PromptOptions,
  withSource: boolean,
): string[] {
  const notes: string[] = [];
  const shadcnComponents = entry.registryDependencies;
  const authoredInTypeScript = entry.sourceFiles.some((file) => /\.tsx?$/.test(file));

  if (options.language === 'typescript') {
    notes.push('Use TypeScript with strict types. Export the props interface.');
  } else {
    notes.push('Use JavaScript (`.jsx`). Document the props with JSDoc.');
    if (withSource && authoredInTypeScript) {
      notes.push('The reference is TypeScript: convert it to JavaScript, removing the type annotations.');
    }
  }

  if (options.framework === 'nextjs') {
    notes.push(
      "This is a Next.js App Router project: add the `'use client'` directive to any file that uses state, effects, refs, event handlers or browser APIs.",
    );
  }

  if (shadcnComponents.length > 0) {
    const list = shadcnComponents.map((name) => `\`${name}\``).join(', ');
    notes.push(
      `It builds on these shadcn/ui components, imported from \`@/components/ui/*\`: ${list}. If any are missing, install them with \`npx shadcn@latest add ${shadcnComponents.join(' ')}\`.`,
    );
  }

  if (withSource && source?.files.some((file) => file.code.includes('@/lib/utils'))) {
    notes.push('Class names are merged with the `cn()` helper from `@/lib/utils`, as in any shadcn/ui project.');
  }

  notes.push(
    entry.dependencies.length > 0
      ? `npm dependencies: ${entry.dependencies.map((name) => `\`${name}\``).join(', ')}. Include the install command.`
      : shadcnComponents.length > 0
        ? 'Do not add other third-party dependencies.'
        : 'Do not add third-party dependencies. Use React and the platform only.',
  );

  return notes;
}

/**
 * Builds an AI-ready prompt for recreating or integrating a component.
 * Pass `source` to embed the reference implementation (`mode: 'source'`).
 */
export function buildPrompt(
  entry: ComponentEntry,
  source: ComponentSource | null,
  options: PromptOptions,
): string {
  const withSource = options.mode === 'source' && source !== null && source.files.length > 0;
  const stack = options.framework === 'nextjs' ? 'Next.js (App Router)' : 'React';
  const language = options.language === 'typescript' ? 'TypeScript' : 'JavaScript';

  const parts: string[] = [
    `Add a **${entry.name}** component to my ${stack} project, written in ${language}.`,
    section('What it is', entry.description),
  ];

  if (entry.features.length > 0) {
    parts.push(section('Requirements', bullets(entry.features)));
  }
  if (entry.props.length > 0) {
    parts.push(section('Props', entry.props.map(formatProp).join('\n')));
  }
  if (entry.prompt?.trim()) {
    parts.push(section('Implementation notes', entry.prompt.trim()));
  }

  parts.push(section('Project setup', bullets(stackNotes(entry, source, options, withSource))));
  parts.push(section('Styling', stylingInstructions(entry, options, withSource)));

  if (withSource && source) {
    const files = source.files.map((file) => `### \`${file.name}\`\n\n${codeFence(file)}`);
    if (source.usage) {
      files.push(`### Usage example\n\n${codeFence(source.usage)}`);
    }
    parts.push(
      section(
        'Reference implementation',
        [
          'Treat this code as the source of truth for behaviour and visual design. Change only what my stack requires.',
          ...files,
        ].join('\n\n'),
      ),
    );
  }

  parts.push(
    section(
      'Quality bar',
      bullets([
        'Accessible: semantic HTML, full keyboard support, visible focus states and correct ARIA attributes.',
        'Responsive, and looks right in both light and dark themes.',
        'No borders and no gradients: separate surfaces with color contrast (different background tones) only.',
        'Respects `prefers-reduced-motion` for any animation.',
        'Self-contained: no imports from files that do not exist in my project.',
        'No placeholders or TODOs.',
      ]),
    ),
  );

  parts.push(
    section(
      'Deliverables',
      [
        '1. The complete code for every file, each in its own code block headed by its file path.',
        '2. The install command for any dependency.',
        '3. A short usage example.',
      ].join('\n'),
    ),
  );

  return parts.join('\n\n');
}
