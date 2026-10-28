import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  /** Compact fallback without details, for thumbnails. */
  compact?: boolean;
}

interface State {
  error: Error | null;
}

/** Keeps a crashing demo from taking the whole page down. */
export class PreviewErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[preview] Demo crashed:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.compact) {
      return (
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <TriangleAlert className="size-3.5 text-amber-500" aria-hidden />
          Preview unavailable
        </div>
      );
    }

    return (
      <div className="flex max-w-md flex-col items-center gap-2.5 p-6 text-center" role="alert">
        <div className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <strong className="text-sm font-semibold">This preview crashed</strong>
        <code className="max-w-full bg-destructive/10 px-3 py-2 text-xs whitespace-normal text-destructive [overflow-wrap:anywhere]">
          {error.message}
        </code>
        <Button variant="outline" size="sm" className="mt-1" onClick={() => this.setState({ error: null })}>
          <RotateCcw /> Try again
        </Button>
      </div>
    );
  }
}
