import type { LucideIcon } from 'lucide-react';
import {
  BellRing,
  Image,
  LayoutTemplate,
  MousePointerClick,
  Navigation,
  Palette,
  PanelsTopLeft,
  Table2,
  TextCursorInput,
  Type,
  WandSparkles,
} from 'lucide-react';

export interface CategoryDefinition {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Component categories, in display order.
 * Add, remove or rename freely: a component's `category` must be one of these ids.
 */
export const categories = [
  {
    id: 'buttons',
    label: 'Buttons',
    description: 'Actions, toggles and calls to action.',
    icon: MousePointerClick,
  },
  {
    id: 'inputs',
    label: 'Inputs & Forms',
    description: 'Text fields, selects, checkboxes and form controls.',
    icon: TextCursorInput,
  },
  {
    id: 'navigation',
    label: 'Navigation',
    description: 'Menus, tabs, breadcrumbs and pagination.',
    icon: Navigation,
  },
  {
    id: 'overlays',
    label: 'Overlays',
    description: 'Dialogs, drawers, popovers and tooltips.',
    icon: PanelsTopLeft,
  },
  {
    id: 'feedback',
    label: 'Feedback',
    description: 'Alerts, toasts, progress and loading states.',
    icon: BellRing,
  },
  {
    id: 'data-display',
    label: 'Data Display',
    description: 'Cards, tables, lists, badges and avatars.',
    icon: Table2,
  },
  {
    id: 'layout',
    label: 'Layout',
    description: 'Containers, grids, stacks and page sections.',
    icon: LayoutTemplate,
  },
  {
    id: 'typography',
    label: 'Typography',
    description: 'Headings, text effects and inline code.',
    icon: Type,
  },
  {
    id: 'media',
    label: 'Media',
    description: 'Images, carousels, video and galleries.',
    icon: Image,
  },
  {
    id: 'animation',
    label: 'Animation',
    description: 'Motion primitives and animated effects.',
    icon: WandSparkles,
  },
  {
    id: 'backgrounds',
    label: 'Backgrounds',
    description: 'Patterns, textures and decorative surfaces.',
    icon: Palette,
  },
] as const satisfies readonly CategoryDefinition[];

export type CategoryId = (typeof categories)[number]['id'];

export function getCategory(id: string): CategoryDefinition | undefined {
  return categories.find((category) => category.id === id);
}
