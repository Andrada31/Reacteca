import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getCategorySummaries } from '@/registry';
import { navItems } from './nav-items';

/** The navigation as a slide-in sheet on small screens. */
export function MobileNav() {
  const categories = getCategorySummaries().filter((category) => category.count > 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 bg-background p-6 sm:max-w-sm">
        <SheetHeader className="p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="mt-10 flex flex-col gap-10">
          <ul className="flex flex-col gap-1">
            <li>
              <SheetClose asChild>
                <Link to="/" className="text-3xl font-semibold tracking-tight">
                  Home
                </Link>
              </SheetClose>
            </li>
            {navItems.map((item) => (
              <li key={item.to}>
                <SheetClose asChild>
                  <Link to={item.to} className="text-3xl font-semibold tracking-tight">
                    {item.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
          {categories.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {categories.map((category) => (
                  <li key={category.id}>
                    <SheetClose asChild>
                      <Link to={`/components?category=${category.id}`} className="text-lg font-medium">
                        {category.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <SheetClose asChild>
            <Button size="lg" className="h-12 font-semibold" asChild>
              <Link to="/getting-started#add-a-component">Add a component</Link>
            </Button>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
