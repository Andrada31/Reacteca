import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="mb-2.5 flex items-center gap-2 text-sm font-medium text-muted-foreground [&_a:hover]:text-foreground [&_svg]:size-4">
            {eyebrow}
          </div>
        )}
        <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">{title}</h1>
        {description && <p className="mt-4 text-lg text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
