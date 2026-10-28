import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TileHoverContext, useTileHover } from './preview/tile-hover';

interface PreviewCardProps {
  to: string;
  title: string;
  subtitle?: ReactNode;
  /** Shown beside the title, e.g. a status badge. */
  badge?: ReactNode;
  /** The preview, set on a white panel. */
  children: ReactNode;
}

/** A gray frame holding a white preview panel, with the title and subtitle underneath inside the frame. */
export function PreviewCard({ to, title, subtitle, badge, children }: PreviewCardProps) {
  const { active, handlers } = useTileHover();

  return (
    <article
      className="group relative rounded-[1.75rem] bg-card p-1.5 transition-colors duration-200 hover:bg-muted has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50"
      {...handlers}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-[1.375rem] bg-background">
        {/* A thumbnail inside plays while the card is hovered. */}
        <TileHoverContext.Provider value={active}>{children}</TileHoverContext.Provider>
      </div>
      <div className="flex items-start justify-between gap-3 px-3.5 pt-3.5 pb-3">
        <div className="min-w-0">
          {/* The link's ::after covers the whole card, so it's one click target. */}
          <h3 className="truncate text-lg font-semibold tracking-tight">
            <Link to={to} className="outline-none after:absolute after:inset-0">
              {title}
            </Link>
          </h3>
          {subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {badge}
      </div>
    </article>
  );
}
