import { Link } from 'react-router-dom';
import { GithubIcon } from '@/components/brand/GithubIcon';
import { siteConfig } from '@/config/site';

const year = new Date().getFullYear();

interface FooterLink {
  label: string;
  to: string;
  external?: boolean;
  badge?: string;
}

const columns: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: 'Library',
    links: [
      { label: 'Components', to: '/components' },
      { label: 'Getting started', to: '/getting-started' },
      { label: 'Add a component', to: '/getting-started#add-a-component' },
    ],
  },
  {
    title: 'Views',
    links: [
      { label: 'Preview', to: '/getting-started#use-a-component' },
      { label: 'Code', to: '/getting-started#use-a-component' },
      { label: 'Prompt', to: '/getting-started#use-a-component', badge: 'New' },
    ],
  },
  {
    title: 'Built with',
    links: [
      { label: 'React', to: 'https://react.dev', external: true },
      { label: 'shadcn/ui', to: 'https://ui.shadcn.com', external: true },
      { label: 'Tailwind CSS', to: 'https://tailwindcss.com', external: true },
      { label: 'Framer Motion', to: 'https://motion.dev', external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between gap-12">
          <div>
            <p className="text-3xl font-bold tracking-tight">{siteConfig.name}</p>
            <p className="mt-3 max-w-xs text-sm text-footer-muted">{siteConfig.tagline}.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-sm text-footer-muted">{column.title}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label} className="flex items-center gap-2">
                      {link.external ? (
                        <a href={link.to} target="_blank" rel="noreferrer" className="text-[15px] font-medium hover:text-footer-muted">
                          {link.label}
                        </a>
                      ) : (
                        <Link to={link.to} className="text-[15px] font-medium hover:text-footer-muted">
                          {link.label}
                        </Link>
                      )}
                      {link.badge && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{link.badge}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 text-sm text-footer-muted">
          <p>
            © {year} {siteConfig.author}.
          </p>
          <div className="flex items-center gap-5">
            <span className="font-mono text-xs">v{siteConfig.version}</span>
            {siteConfig.links.github && (
              <a href={siteConfig.links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-footer-foreground">
                <GithubIcon className="size-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
