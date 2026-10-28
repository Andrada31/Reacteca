import { Link, NavLink } from 'react-router-dom';
import { Search } from 'lucide-react';
import { GithubIcon } from '@/components/brand/GithubIcon';
import { Logo } from '@/components/brand/Logo';
import { IconButton } from '@/components/IconButton';
import { useSearch } from '@/components/search/search-context';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { siteConfig } from '@/config/site';
import { modKey } from '@/lib/format';
import { cn } from '@/lib/utils';
import { MobileNav } from './MobileNav';
import { navItems } from './nav-items';

export function SiteHeader() {
  const { openSearch } = useSearch();

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="mr-4 rounded-full" aria-label={`${siteConfig.name} home`}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 max-md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors hover:bg-muted',
                  isActive && 'bg-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search components"
            className="flex h-10 items-center gap-2.5 rounded-full bg-muted px-4 text-sm text-muted-foreground transition-colors hover:bg-surface-3 max-sm:w-10 max-sm:justify-center max-sm:px-0 sm:w-56 lg:w-64"
          >
            <Search className="size-4 shrink-0" aria-hidden />
            <span className="max-sm:hidden">Search components…</span>
            <KbdGroup className="ml-auto max-lg:hidden">
              <Kbd>{modKey}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </button>
          {siteConfig.links.github && (
            <IconButton label="GitHub repository" size="icon" asChild>
              <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
                <GithubIcon />
              </a>
            </IconButton>
          )}
          <ThemeToggle />
          <Button className="ml-1.5 h-10 px-4.5 font-semibold max-md:hidden" asChild>
            <Link to="/getting-started#add-a-component">Add a component</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
