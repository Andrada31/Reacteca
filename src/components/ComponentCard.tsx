import { Link } from 'react-router-dom';
import { getCategory, type ComponentEntry } from '@/registry';
import { ComponentThumbnail } from './preview/ComponentThumbnail';
import { StatusBadge } from './StatusBadge';

/** A library tile, mobbin.com style: a large gray thumbnail with the name underneath. */
export function ComponentCard({ entry }: { entry: ComponentEntry }) {
  const category = getCategory(entry.category);

  return (
    <article className="group relative">
      <div className="aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-card transition-colors duration-200 group-hover:bg-muted group-has-[a:focus-visible]:ring-3 group-has-[a:focus-visible]:ring-ring/50">
        <ComponentThumbnail entry={entry} className="on-surface-1 group-hover:on-surface-2" />
      </div>
      <div className="flex items-start justify-between gap-3 px-1 pt-3.5">
        <div className="min-w-0">
          {/* The link's ::after covers the whole tile, so it's one click target. */}
          <h3 className="truncate text-[15px] font-semibold tracking-tight">
            <Link to={`/components/${entry.slug}`} className="outline-none after:absolute after:inset-0">
              {entry.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {category?.label}
            {category && entry.description && ' · '}
            {entry.description}
          </p>
        </div>
        <StatusBadge status={entry.status} hideStable />
      </div>
    </article>
  );
}
