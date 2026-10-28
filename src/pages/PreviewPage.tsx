import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DemoRenderer } from '@/components/preview/DemoRenderer';
import { layoutClass, patternClass } from '@/components/preview/patterns';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';
import { getComponent, type PreviewBackground } from '@/registry';
import { useTheme, type ResolvedTheme } from '@/theme/theme-context';
import { NotFoundPage } from './NotFoundPage';

const themes: ResolvedTheme[] = ['light', 'dark'];
const backgrounds: PreviewBackground[] = ['grid', 'dots', 'plain'];

/**
 * A component's demo on its own page: real viewport, real media queries.
 * Accepts ?theme=light|dark and ?bg=grid|dots|plain.
 */
export function PreviewPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const { resolved } = useTheme();
  const entry = getComponent(slug);
  useDocumentTitle(entry ? `${entry.name} preview` : undefined);

  if (!entry) {
    return (
      <div className="px-4">
        <NotFoundPage title="Component not found" />
      </div>
    );
  }

  const theme = themes.find((value) => value === params.get('theme')) ?? resolved;
  const background = backgrounds.find((value) => value === params.get('bg')) ?? entry.preview?.background ?? 'grid';
  const layout = entry.preview?.layout ?? 'centered';

  return (
    <div className={cn(theme, 'flex min-h-dvh flex-col bg-background text-foreground', patternClass[background])}>
      <Link
        to={`/components/${entry.slug}`}
        className="fixed top-4 left-4 z-10 inline-flex h-8.5 items-center gap-2 rounded-full bg-muted pr-3.5 pl-2.5 text-sm font-medium hover:bg-surface-3"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {entry.name}
      </Link>
      <main className={cn('flex flex-1 flex-col', layoutClass[layout], layout !== 'fullscreen' && 'pt-18')}>
        <DemoRenderer slug={entry.slug} />
      </main>
    </div>
  );
}
