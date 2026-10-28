import { useLayoutEffect, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';
import { getCategory, type ComponentEntry } from '@/registry';
import { DemoRenderer } from './DemoRenderer';
import { layoutClass } from './patterns';

/**
 * The canvas a thumbnail lays out on, in CSS pixels, before it's scaled down to the tile. It's fixed (and
 * 4:3, like the tiles) so a demo looks the same in every tile size instead of switching to its narrow
 * layout in small ones.
 */
const thumbnailStage = { width: 600, height: 450 };

interface ComponentThumbnailProps {
  entry: ComponentEntry;
  className?: string;
}

/**
 * A scaled-down, non-interactive live preview, mounted when scrolled into view. It shows the component's
 * thumbnail.tsx if it has one, otherwise its demo laid out as in the Preview tab.
 */
export function ComponentThumbnail({ entry, className }: ComponentThumbnailProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [scale, setScale] = useState(0);
  const CategoryIcon = getCategory(entry.category)?.icon;

  useLayoutEffect(() => {
    const tile = ref.current;
    if (!tile) return;
    // The first callback arrives before the first paint, so the stage never shows at the wrong size.
    const observer = new ResizeObserver(() => {
      setScale(Math.min(tile.clientWidth / thumbnailStage.width, tile.clientHeight / thumbnailStage.height));
    });
    observer.observe(tile);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <div
      ref={ref}
      inert
      className={cn('pointer-events-none relative grid h-full place-items-center overflow-hidden', className)}
    >
      {entry.hasDemo || entry.hasThumbnail ? (
        inView &&
        scale > 0 && (
          // Centred on the tile and scaled about its own centre, so content that overflows the stage is
          // cropped evenly on every side.
          <div
            className={cn(
              'absolute top-1/2 left-1/2 flex flex-col',
              layoutClass[entry.hasThumbnail ? 'fullscreen' : (entry.preview?.layout ?? 'centered')],
            )}
            style={{
              width: thumbnailStage.width,
              height: thumbnailStage.height,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            <DemoRenderer slug={entry.slug} compact thumbnail={entry.hasThumbnail} />
          </div>
        )
      ) : (
        CategoryIcon && <CategoryIcon className="size-9 text-muted-foreground/50" aria-hidden />
      )}
    </div>
  );
}
