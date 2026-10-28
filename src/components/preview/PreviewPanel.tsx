import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Grid3x3, Grip, Monitor, Moon, RotateCcw, Smartphone, Square, Sun, Tablet } from 'lucide-react';
import { IconButton } from '@/components/IconButton';
import { SegmentedControl, type SegmentOption } from '@/components/SegmentedControl';
import { cn } from '@/lib/utils';
import type { ComponentEntry, PreviewBackground } from '@/registry';
import { useTheme, type ResolvedTheme } from '@/theme/theme-context';
import { DemoRenderer } from './DemoRenderer';
import { layoutClass, patternClass } from './patterns';

type Viewport = 'desktop' | 'tablet' | 'mobile';

const viewportWidths: Record<Viewport, number | null> = { desktop: null, tablet: 768, mobile: 390 };

const viewportOptions: SegmentOption<Viewport>[] = [
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'tablet', label: 'Tablet (768px)', icon: Tablet },
  { value: 'mobile', label: 'Mobile (390px)', icon: Smartphone },
];

const backgroundOptions: SegmentOption<PreviewBackground>[] = [
  { value: 'grid', label: 'Grid background', icon: Grid3x3 },
  { value: 'dots', label: 'Dotted background', icon: Grip },
  { value: 'plain', label: 'Plain background', icon: Square },
];

export function PreviewPanel({ entry }: { entry: ComponentEntry }) {
  const { resolved } = useTheme();
  const [themeOverride, setThemeOverride] = useState<ResolvedTheme | null>(null);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [background, setBackground] = useState<PreviewBackground>(entry.preview?.background ?? 'grid');
  const [reloadKey, setReloadKey] = useState(0);

  const previewTheme = themeOverride ?? resolved;
  const nextTheme: ResolvedTheme = previewTheme === 'dark' ? 'light' : 'dark';
  const width = viewportWidths[viewport];

  return (
    <div className="rounded-[1.75rem] bg-card p-1.5">
      <div className="flex items-center justify-between gap-3 px-1 pt-0.5 pb-2">
        <div className="flex items-center gap-1">
          <SegmentedControl label="Viewport" iconOnly value={viewport} options={viewportOptions} onChange={setViewport} />
          <span className="min-w-14 pl-2 font-mono text-xs text-muted-foreground">{width ? `${width}px` : '100%'}</span>
        </div>
        <div className="flex items-center gap-1">
          <SegmentedControl
            label="Canvas background"
            iconOnly
            value={background}
            options={backgroundOptions}
            onChange={setBackground}
            className="mr-2 max-sm:hidden"
          />
          <IconButton label={`Preview in ${nextTheme} theme`} onClick={() => setThemeOverride(nextTheme)}>
            {previewTheme === 'dark' ? <Sun /> : <Moon />}
          </IconButton>
          <IconButton label="Reload preview" onClick={() => setReloadKey((key) => key + 1)}>
            <RotateCcw />
          </IconButton>
          <IconButton label="Open in a new tab" asChild>
            <Link to={`/preview/${entry.slug}?theme=${previewTheme}&bg=${background}`} target="_blank">
              <ExternalLink />
            </Link>
          </IconButton>
        </div>
      </div>

      {/* The theme class re-scopes every token, so the canvas can differ from the page. */}
      <div
        className={cn(
          previewTheme,
          'flex justify-center overflow-auto rounded-[1.375rem] text-foreground transition-colors',
          // At a fixed width the frame is the canvas and the stage around it recedes.
          width === null ? cn('bg-background', patternClass[background]) : 'bg-muted',
        )}
        style={{ minHeight: entry.preview?.height ?? 420 }}
      >
        <div
          className={cn(
            'flex max-w-full flex-col transition-[width] duration-300 ease-out',
            layoutClass[entry.preview?.layout ?? 'centered'],
            width !== null && cn('bg-background', patternClass[background]),
          )}
          style={{ width: width ?? '100%' }}
        >
          <DemoRenderer key={reloadKey} slug={entry.slug} />
        </div>
      </div>
    </div>
  );
}
