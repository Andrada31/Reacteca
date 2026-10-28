import { useEffect, useState } from 'react';
import { loadSource, type ComponentSource } from '@/registry';

type SourceState =
  | { status: 'idle' | 'loading'; source: null }
  | { status: 'ready'; source: ComponentSource }
  | { status: 'error'; source: null };

/**
 * Loads a component's source without suspending, for UIs that should stay
 * interactive while it loads. Pass `enabled: false` to skip loading.
 */
export function useComponentSource(slug: string, enabled = true): SourceState {
  const [state, setState] = useState<{ slug: string; result: SourceState } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadSource(slug).then(
      (source) => !cancelled && setState({ slug, result: { status: 'ready', source } }),
      () => !cancelled && setState({ slug, result: { status: 'error', source: null } }),
    );
    return () => {
      cancelled = true;
    };
  }, [slug, enabled]);

  if (!enabled) return { status: 'idle', source: null };
  return state?.slug === slug ? state.result : { status: 'loading', source: null };
}
