import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Calendar,
  Check,
  CodeXml,
  Eye,
  FileCode2,
  Package,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { CodePanel } from '@/components/code/CodePanel';
import { easeOut, indicatorSpring } from '@/lib/motion';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { PromptPanel } from '@/components/prompt/PromptPanel';
import { PropsTable } from '@/components/PropsTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate, pluralize } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getAdjacentComponents, getCategory, getComponent, type ComponentEntry } from '@/registry';
import { NotFoundPage } from './NotFoundPage';

type View = 'preview' | 'code' | 'prompt';

const views: Array<{ value: View; label: string; icon: LucideIcon; hint: string }> = [
  { value: 'preview', label: 'Preview', icon: Eye, hint: 'Try the live component.' },
  { value: 'code', label: 'Code', icon: CodeXml, hint: 'Copy the source into your project.' },
  { value: 'prompt', label: 'Prompt', icon: Sparkles, hint: 'Hand it to your AI assistant.' },
];

function parseView(value: string | null): View {
  return views.find((view) => view.value === value)?.value ?? 'preview';
}

export function ComponentPage() {
  const { slug = '' } = useParams();
  const entry = getComponent(slug);
  useDocumentTitle(entry?.name);

  if (!entry) {
    return (
      <NotFoundPage
        title="Component not found"
        description={`There's no component called “${slug}” in the library. It may have been renamed or removed.`}
      />
    );
  }

  // Keyed so every per-component state (tabs, preview settings) resets on navigation.
  return <ComponentDetails key={entry.slug} entry={entry} />;
}

function ComponentDetails({ entry }: { entry: ComponentEntry }) {
  const [params, setParams] = useSearchParams();
  const view = parseView(params.get('view'));
  const setView = (next: string) =>
    setParams(next === 'preview' ? {} : { view: next }, { replace: true, preventScrollReset: true });

  const category = getCategory(entry.category);
  const { previous, next } = getAdjacentComponents(entry.slug);
  const hint = views.find((item) => item.value === view)?.hint;

  return (
    <article className="flex flex-col">
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/components">Components</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/components?category=${category.id}`}>{category.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{entry.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-7">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">{entry.name}</h1>
          <StatusBadge status={entry.status} />
        </div>
        <p className="mt-2.5 max-w-2xl text-base text-muted-foreground sm:text-[17px]">{entry.description}</p>

        {entry.inspiration.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <span className="mr-1">Inspired by</span>
            {entry.inspiration.map((credit) => (
              <Badge
                key={credit.href}
                variant="outline"
                className="h-6.5 bg-muted px-2.5 text-foreground transition-colors hover:bg-surface-3"
                asChild
              >
                <a href={credit.href} target="_blank" rel="noreferrer">
                  {credit.label}
                  <ArrowUpRight aria-hidden />
                </a>
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-4.5 gap-y-2 text-sm text-muted-foreground [&_svg]:size-3.5">
          {category && (
            <Badge variant="outline" className="h-6.5 bg-primary/15 px-2.5 text-primary-strong" asChild>
              <Link to={`/components?category=${category.id}`}>
                <category.icon aria-hidden />
                {category.label}
              </Link>
            </Badge>
          )}
          {entry.addedAt && (
            <MetaItem icon={Calendar}>Added {formatDate(entry.addedAt)}</MetaItem>
          )}
          {entry.registryDependencies.length > 0 && (
            <MetaItem icon={Blocks}>{pluralize(entry.registryDependencies.length, 'shadcn/ui component')}</MetaItem>
          )}
          <MetaItem icon={Package}>
            {entry.dependencies.length > 0
              ? pluralize(entry.dependencies.length, 'dependency', 'dependencies')
              : 'No dependencies'}
          </MetaItem>
          <MetaItem icon={FileCode2}>{pluralize(entry.sourceFiles.length, 'file')}</MetaItem>
        </div>

        {entry.tags.length > 0 && (
          <ul className="mt-3.5 flex flex-wrap gap-1.5" aria-label="Tags">
            {entry.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline" className="bg-muted font-mono font-normal text-muted-foreground hover:text-foreground" asChild>
                  <Link to={`/components?q=${encodeURIComponent(tag)}`}>#{tag}</Link>
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </header>

      <Tabs value={view} onValueChange={setView} className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList aria-label="View" className="p-1 group-data-horizontal/tabs:h-11 max-sm:w-full">
            {views.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="isolate px-4 data-active:bg-transparent max-sm:flex-1">
                {view === value && (
                  <motion.span
                    layoutId="component-view-indicator"
                    transition={indicatorSpring}
                    className="absolute inset-0 -z-10 rounded-full bg-background"
                  />
                )}
                <Icon />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <p className="text-sm text-muted-foreground max-sm:hidden">{hint}</p>
        </div>
        <TabsContent value="preview">
          <PanelIn>
            <PreviewPanel entry={entry} />
          </PanelIn>
        </TabsContent>
        <TabsContent value="code">
          <PanelIn>
            <CodePanel entry={entry} />
          </PanelIn>
        </TabsContent>
        <TabsContent value="prompt">
          <PanelIn>
            <PromptPanel entry={entry} />
          </PanelIn>
        </TabsContent>
      </Tabs>

      {entry.features.length > 0 && (
        <section className="mt-12" aria-labelledby="features-heading">
          <h2 id="features-heading" className="mb-4 text-xl font-semibold tracking-tight">
            Features
          </h2>
          <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {entry.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 rounded-full bg-primary/15 p-0.5 text-primary-strong" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      {entry.props.length > 0 && (
        <section className="mt-12" aria-labelledby="api-heading">
          <h2 id="api-heading" className="mb-4 text-xl font-semibold tracking-tight">
            API reference
          </h2>
          <PropsTable props={entry.props} />
        </section>
      )}

      {(previous || next) && (
        <nav className="mt-16 grid grid-cols-2 gap-4" aria-label="More components">
          {previous ? <PagerLink entry={previous} direction="previous" /> : <span />}
          {next && <PagerLink entry={next} direction="next" />}
        </nav>
      )}
    </article>
  );
}

/** Fades a tab panel in as it mounts. */
function PanelIn({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: easeOut }}>
      {children}
    </motion.div>
  );
}

function MetaItem({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon aria-hidden />
      {children}
    </span>
  );
}

function PagerLink({ entry, direction }: { entry: ComponentEntry; direction: 'previous' | 'next' }) {
  const isNext = direction === 'next';
  return (
    <Card
      className={cn(
        'relative gap-1 rounded-[1.5rem] px-5 py-4 transition-colors hover:bg-muted has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50',
        isNext && 'col-start-2 items-end text-right',
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        {!isNext && <ArrowLeft className="size-3.5" aria-hidden />}
        {isNext ? 'Next' : 'Previous'}
        {isNext && <ArrowRight className="size-3.5" aria-hidden />}
      </span>
      <Link to={`/components/${entry.slug}`} className="text-[15px] font-semibold outline-none after:absolute after:inset-0">
        {entry.name}
      </Link>
    </Card>
  );
}
