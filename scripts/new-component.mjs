#!/usr/bin/env node
/**
 * Scaffolds a component folder in src/library.
 *
 *   npm run new -- "Pill Button" --category buttons
 *   npm run new -- "Pill Button" -c buttons -d "A fully rounded call-to-action button." --status beta
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const libraryDir = join(root, 'src', 'library');
const categoriesFile = join(root, 'src', 'registry', 'categories.ts');
const statuses = ['new', 'beta', 'stable', 'deprecated'];

const categoryIds = [...readFileSync(categoriesFile, 'utf8').matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);

const usage = `
  Usage
    npm run new -- "<Component Name>" --category <id> [options]

  Options
    -c, --category <id>       Required. One of: ${categoryIds.join(', ')}
    -d, --description <text>  One-sentence description
    -s, --status <status>     ${statuses.join(' | ')} (default: new)
    -h, --help                Show this message
`;

function fail(message) {
  console.error(`\n  ✖ ${message}\n${usage}`);
  process.exit(1);
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      category: { type: 'string', short: 'c' },
      description: { type: 'string', short: 'd' },
      status: { type: 'string', short: 's', default: 'new' },
      help: { type: 'boolean', short: 'h' },
    },
  });
} catch (error) {
  fail(error.message);
}

const { values, positionals } = parsed;

if (values.help) {
  console.log(usage);
  process.exit(0);
}

const name = positionals.join(' ').trim();
if (!name) fail('Missing the component name.');
if (!values.category) fail('Missing --category.');
if (!categoryIds.includes(values.category)) fail(`Unknown category "${values.category}".`);
if (!statuses.includes(values.status)) fail(`Unknown status "${values.status}".`);

// "Pill Button", "pill-button" and "PillButton" all become PillButton / pill-button.
const words = name
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .split(/[^a-zA-Z0-9]+/)
  .filter(Boolean);
if (words.length === 0 || !/^[a-zA-Z]/.test(words[0])) fail('The name must start with a letter.');

const pascalName = words.map((word) => word[0].toUpperCase() + word.slice(1)).join('');
const slug = words.map((word) => word.toLowerCase()).join('-');
const dir = join(libraryDir, slug);
if (existsSync(dir)) fail(`src/library/${slug} already exists.`);

const quote = (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const today = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD in local time
const description = values.description?.trim() || `TODO: describe what ${name} does and when to use it.`;

const files = {
  'meta.ts': `import { defineComponent } from '@/registry/define';

export default defineComponent({
  name: ${quote(name)},
  description: ${quote(description)},
  category: ${quote(values.category)},
  tags: [],
  status: ${quote(values.status)},
  addedAt: ${quote(today)},
  registryDependencies: [],
  dependencies: [],
  features: [],
  props: [
    { name: 'children', type: 'ReactNode', description: 'Content to render inside the component.' },
  ],
});
`,

  'demo.tsx': `import { ${pascalName} } from './${pascalName}';

export default function Demo() {
  return <${pascalName}>${name}</${pascalName}>;
}
`,

  [`${pascalName}.tsx`]: `import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ${pascalName}Props = ComponentProps<'div'>;

export function ${pascalName}({ className, ...props }: ${pascalName}Props) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-medium text-card-foreground',
        className,
      )}
      {...props}
    />
  );
}
`,
};

mkdirSync(dir, { recursive: true });
for (const [file, content] of Object.entries(files)) {
  writeFileSync(join(dir, file), content);
}

console.log(`
  ✔ Created src/library/${slug}/
      ${Object.keys(files).join('\n      ')}

  Next steps
    1. Describe it in meta.ts (description, features, props)
    2. Build it in ${pascalName}.tsx (Tailwind + shadcn/ui) and show it off in demo.tsx
    3. Run npm run dev and open /components/${slug}
`);
