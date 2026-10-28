import type { ComponentMeta } from './types';

/**
 * Typed helper for a component's `meta.ts`.
 * Import it from '@/registry/define' (not '@/registry') to avoid an import cycle.
 */
export function defineComponent(meta: ComponentMeta): ComponentMeta {
  return meta;
}
