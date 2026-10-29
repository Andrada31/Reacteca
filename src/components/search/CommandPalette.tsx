import { useNavigate } from 'react-router-dom';
import { BookOpen, Box, House, LayoutGrid, Moon, Sun } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { allComponents, getCategory } from '@/registry';
import { useTheme, type Theme } from '@/theme/theme-context';

const pages = [
  { to: '/', label: 'Home', icon: House },
  { to: '/components', label: 'All components', icon: LayoutGrid },
  { to: '/getting-started', label: 'Getting started', icon: BookOpen },
];

const themes: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light theme', icon: Sun },
  { value: 'dark', label: 'Dark theme', icon: Moon },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** ⌘K / Ctrl+K search over components, pages and theme actions. */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search components, pages and actions"
      className="sm:max-w-xl"
    >
      <Command>
        <CommandInput placeholder="Search components, pages and actions…" />
        <CommandList className="max-h-[min(420px,60vh)]">
          <CommandEmpty>No results found.</CommandEmpty>

          {allComponents.length > 0 && (
            <>
              <CommandGroup heading="Components">
                {allComponents.map((entry) => {
                  const category = getCategory(entry.category);
                  const Icon = category?.icon ?? Box;
                  return (
                    <CommandItem
                      key={entry.slug}
                      value={`${entry.name} ${entry.slug}`}
                      keywords={[...entry.tags, category?.label ?? '', entry.description]}
                      onSelect={() => run(() => navigate(`/components/${entry.slug}`))}
                    >
                      <Icon />
                      {entry.name}
                      <CommandShortcut className="tracking-normal">{category?.label}</CommandShortcut>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          <CommandGroup heading="Pages">
            {pages.map(({ to, label, icon: Icon }) => (
              <CommandItem key={to} value={label} onSelect={() => run(() => navigate(to))}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Theme">
            {themes.map(({ value, label, icon: Icon }) => (
              <CommandItem key={value} value={label} onSelect={() => run(() => setTheme(value))}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <div className="mt-1 flex items-center gap-4 rounded-lg bg-surface-3/60 px-3 py-2 text-xs text-muted-foreground max-sm:hidden" aria-hidden>
          <span className="inline-flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>↵</Kbd> select
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <Kbd>Esc</Kbd> close
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
}
