import { Suspense } from 'react';
import { FileQuestion } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getDemo } from '@/registry';
import { PreviewErrorBoundary } from './PreviewErrorBoundary';

interface DemoRendererProps {
  slug: string;
  compact?: boolean;
}

/** Lazy-loads and renders a component's demo.tsx, isolated by an error boundary. */
export function DemoRenderer({ slug, compact = false }: DemoRendererProps) {
  const Demo = getDemo(slug);

  if (!Demo) {
    return (
      <div className="inline-flex items-center gap-2 text-center text-sm text-muted-foreground">
        <FileQuestion className="size-4 opacity-70" aria-hidden />
        {compact ? (
          'No demo'
        ) : (
          <span>
            No demo yet. Add a <code>demo.tsx</code> to this component's folder.
          </span>
        )}
      </div>
    );
  }

  return (
    <PreviewErrorBoundary compact={compact}>
      <Suspense fallback={<Spinner className="size-5 text-muted-foreground" aria-label="Loading preview" />}>
        {/* oxlint-disable-next-line react/static-components -- getDemo caches one lazy component per slug */}
        <Demo />
      </Suspense>
    </PreviewErrorBoundary>
  );
}
