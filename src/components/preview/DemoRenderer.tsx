import { Suspense } from 'react';
import { FileQuestion } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getDemo, getThumbnail } from '@/registry';
import { PreviewErrorBoundary } from './PreviewErrorBoundary';

interface DemoRendererProps {
  slug: string;
  compact?: boolean;
  /** Render the component's thumbnail.tsx (a scene made for library tiles) instead of its demo. */
  thumbnail?: boolean;
}

/** Lazy-loads and renders a component's demo.tsx, isolated by an error boundary. */
export function DemoRenderer({ slug, compact = false, thumbnail = false }: DemoRendererProps) {
  const Demo = thumbnail ? getThumbnail(slug) : getDemo(slug);

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
        {/* oxlint-disable-next-line react/static-components -- the registry caches one lazy component per file */}
        <Demo />
      </Suspense>
    </PreviewErrorBoundary>
  );
}
