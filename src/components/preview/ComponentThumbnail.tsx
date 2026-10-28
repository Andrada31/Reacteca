import { useInView } from '@/hooks/useInView';
import { getCategory, type ComponentEntry } from '@/registry';
import { DemoRenderer } from './DemoRenderer';

/** A scaled-down, non-interactive live preview, mounted when scrolled into view. */
export function ComponentThumbnail({ entry }: { entry: ComponentEntry }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const CategoryIcon = getCategory(entry.category)?.icon;

  return (
    <div
      ref={ref}
      inert
      className="pointer-events-none relative grid h-full place-items-center overflow-hidden"
    >
      {entry.hasDemo ? (
        inView && (
          <div className="grid w-[133%] scale-75 place-items-center">
            <DemoRenderer slug={entry.slug} compact />
          </div>
        )
      ) : (
        CategoryIcon && <CategoryIcon className="size-9 text-muted-foreground/50" aria-hidden />
      )}
    </div>
  );
}
