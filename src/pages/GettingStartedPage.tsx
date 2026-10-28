import { useEffect, useState, type ReactNode } from 'react';
import { CodeXml, Lightbulb, Sparkles, type LucideIcon } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';
import { scaffoldCommand } from '@/components/EmptyLibrary';
import { PageHeader } from '@/components/PageHeader';
import { PropsTable } from '@/components/PropsTable';
import { Card } from '@/components/ui/card';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';
import { categories, type PropDoc } from '@/registry';

const toc = [
  { id: 'use-a-component', label: 'Use a component' },
  { id: 'add-a-component', label: 'Add a component' },
  { id: 'meta-reference', label: 'meta.ts reference' },
  { id: 'customize', label: 'Customize the library' },
];

const folderTree = `src/library/
└── pill-button/          # folder name = URL slug
    ├── meta.ts           # name, description, category, props… (required)
    ├── demo.tsx          # live preview + usage example
    └── PillButton.tsx    # the component; any other source file is shown too`;

const metaExample = `import { defineComponent } from '@/registry/define';

export default defineComponent({
  name: 'Pill Button',
  description: 'A fully rounded call-to-action button with a soft tonal hover.',
  category: 'buttons',
  tags: ['cta', 'rounded'],
  status: 'new',
  addedAt: '2026-10-28',
  registryDependencies: ['button'],
  dependencies: [],
  features: [
    'Fully rounded, with extra horizontal padding',
    'Supports every Button variant and size',
  ],
  props: [
    { name: 'size', type: "'sm' | 'default' | 'lg'", default: "'default'", description: 'Button size.' },
    { name: 'variant', type: "'default' | 'secondary' | 'ghost'", default: "'default'", description: 'Visual style.' },
  ],
  prompt: 'Separate it from its surroundings with color contrast only: no borders, no gradients.',
});`;

const componentExample = `import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PillButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button className={cn('rounded-full px-5', className)} {...props} />;
}`;

const demoExample = `import { PillButton } from './PillButton';

export default function Demo() {
  return <PillButton size="lg">Get started</PillButton>;
}`;

const metaFields: PropDoc[] = [
  { name: 'name', type: 'string', required: true, description: 'Display name, e.g. "Pill Button".' },
  { name: 'description', type: 'string', required: true, description: 'One or two sentences: what it is and when to use it.' },
  { name: 'category', type: 'CategoryId', required: true, description: 'One of the ids listed below.' },
  { name: 'tags', type: 'string[]', description: 'Search keywords, shown as tags.' },
  { name: 'status', type: "'new' | 'beta' | 'stable' | 'deprecated'", default: "'stable'", description: 'Shown as a badge.' },
  { name: 'addedAt', type: 'string', description: 'ISO date (YYYY-MM-DD). Orders "Recently added".' },
  { name: 'registryDependencies', type: 'string[]', description: 'shadcn/ui components it builds on. Powers the "npx shadcn add" command and the prompt.' },
  { name: 'dependencies', type: 'string[]', description: 'npm packages. Powers the install command and the prompt.' },
  { name: 'features', type: 'string[]', description: 'Key behaviours. Shown on the page and used as prompt requirements.' },
  { name: 'props', type: 'PropDoc[]', description: 'API reference table, also included in the prompt.' },
  { name: 'prompt', type: 'string', description: 'Extra implementation notes appended to the AI prompt.' },
  { name: 'files', type: 'string[]', description: 'Files to show in the Code tab, in order. Defaults to all of them.' },
  { name: 'preview', type: '{ layout, height, background }', description: 'Canvas layout (centered, padded, fullscreen), min height and default background.' },
];

/** Tracks which section is in view, for the table of contents. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const tocIds = toc.map((item) => item.id);

export function GettingStartedPage() {
  useDocumentTitle('Getting started');
  const active = useActiveSection(tocIds);

  return (
    <div className="grid gap-14 2xl:grid-cols-[minmax(0,1fr)_200px]">
      <div className="max-w-3xl min-w-0">
        <PageHeader
          eyebrow="Guide"
          title="Getting started"
          description="How to use components from this library, and how to add new ones."
        />

        <Section id="use-a-component" title="Use a component">
          <p>
            Every component page has three views: <strong>Preview</strong>, <strong>Code</strong> and{' '}
            <strong>Prompt</strong>. Pick whichever fits how you work.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <OptionCard icon={CodeXml} label="Option A" title="Copy the code">
              <li>Open a component and switch to the Code tab.</li>
              <li>Run the install commands: shadcn/ui components and npm packages, if listed.</li>
              <li>
                Copy each file (or use Copy all) into your project, e.g. <code>src/components</code>.
              </li>
              <li>Use the Usage tab as a starting point.</li>
            </OptionCard>
            <OptionCard icon={Sparkles} label="Option B" title="Copy the prompt" highlight>
              <li>Open a component and switch to the Prompt tab.</li>
              <li>Pick your language, framework and styling approach.</li>
              <li>Choose “With source” for a faithful copy, or “Spec only” to let the AI write it fresh.</li>
              <li>Copy the prompt and paste it into Claude, ChatGPT, Cursor or v0.</li>
            </OptionCard>
          </div>
        </Section>

        <Section id="add-a-component" title="Add a component">
          <p>
            Components live in <code>src/library</code>, one folder each. The registry discovers them automatically, so
            there are no imports or lists to update. They're written with Tailwind CSS and can build on the shadcn/ui
            components in <code>src/components/ui</code>.
          </p>

          <Step number={1} title="Scaffold it">
            <p>The generator creates the folder with a typed meta file, a demo and a starter component.</p>
            <CodeBlock code={scaffoldCommand} language="bash" copyLabel="Copy command" />
          </Step>

          <Step number={2} title="Know the folder">
            <CodeBlock code={folderTree} language="plain" copyLabel="Copy tree" />
          </Step>

          <Step number={3} title="Build it">
            <p>
              Style with Tailwind and the theme tokens (<code>bg-card</code>, <code>bg-muted</code>,{' '}
              <code>text-muted-foreground</code>…) so it follows light and dark mode. No borders and no gradients:
              separate surfaces by tone. Import shadcn/ui primitives from <code>@/components/ui/*</code> and list them
              in <code>registryDependencies</code>.
            </p>
            <CodeBlock code={componentExample} language="tsx" title="PillButton.tsx" showLineNumbers />
          </Step>

          <Step number={4} title="Describe it in meta.ts">
            <p>
              This drives the page, search, the API table and the generated prompt. The richer the metadata, the better
              the prompt.
            </p>
            <CodeBlock code={metaExample} language="ts" title="meta.ts" showLineNumbers />
          </Step>

          <Step number={5} title="Write the demo">
            <p>
              <code>demo.tsx</code> default-exports what the Preview tab renders. It also appears in the Code tab as the
              usage example, so keep it short and idiomatic.
            </p>
            <CodeBlock code={demoExample} language="tsx" title="demo.tsx" showLineNumbers />
          </Step>

          <div className="mt-8 flex items-start gap-3 rounded-lg bg-primary/10 px-4 py-3.5">
            <Lightbulb className="mt-0.5 size-4.5 shrink-0 text-primary-strong" aria-hidden />
            <p className="text-sm text-foreground">
              Working on something unfinished? Prefix the folder with an underscore (<code>_pill-button</code>) and the
              registry will ignore it.
            </p>
          </div>
        </Section>

        <Section id="meta-reference" title="meta.ts reference">
          <PropsTable props={metaFields} nameLabel="Field" />
          <h3 className="mt-7 mb-3 text-base font-semibold">Category ids</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <code>{category.id}</code>
                <span>{category.label}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="customize" title="Customize the library">
          <ul className="flex list-disc flex-col gap-2.5 pl-5 marker:text-muted-foreground">
            <li>
              <code>src/config/site.ts</code>: name, tagline, author and links.
            </li>
            <li>
              <code>src/registry/categories.ts</code>: add, rename or reorder categories.
            </li>
            <li>
              <code>src/index.css</code>: the theme tokens (light and dark), syntax colors and canvas patterns.
            </li>
            <li>
              <code>src/registry/prompt.ts</code>: the structure and wording of generated prompts.
            </li>
            <li>
              Add shadcn/ui components any time with <code>npx shadcn@latest add &lt;name&gt;</code>.
            </li>
          </ul>
        </Section>
      </div>

      <aside className="sticky top-24 self-start max-2xl:hidden" aria-label="On this page">
        <p className="mb-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">On this page</p>
        <ul className="flex flex-col gap-0.5">
          {toc.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  'block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  active === item.id && 'bg-muted font-medium text-foreground',
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 text-[15px] text-foreground/85 not-first-of-type:mt-16 [&_strong]:font-semibold [&_strong]:text-foreground"
    >
      <h2 className="mb-4 text-3xl font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
      {children}
    </section>
  );
}

interface OptionCardProps {
  icon: LucideIcon;
  label: string;
  title: string;
  highlight?: boolean;
  children: ReactNode;
}

function OptionCard({ icon: Icon, label, title, highlight, children }: OptionCardProps) {
  return (
    <Card className={cn('gap-4 rounded-[1.75rem] px-6 py-6', highlight && 'bg-foreground text-background')}>
      <div className="flex items-center gap-3">
        <span className="grid size-9.5 place-items-center rounded-lg bg-background text-primary-strong">
          <Icon className="size-4.5" aria-hidden />
        </span>
        <div>
          <p className={cn('text-[11px] font-semibold tracking-wider uppercase', highlight ? 'text-background/60' : 'text-muted-foreground')}>{label}</p>
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
      </div>
      <ol className={cn('flex list-decimal flex-col gap-2 pl-5 text-sm marker:font-semibold', highlight ? 'text-background/75' : 'text-muted-foreground')}>
        {children}
      </ol>
    </Card>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div className="relative mt-7 flex gap-4.5">
      <span
        className="grid size-7.5 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary-strong"
        aria-hidden
      >
        {number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-0.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {children}
      </div>
    </div>
  );
}
