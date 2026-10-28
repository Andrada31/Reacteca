import { AnimatePresence, motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Search, SearchX, X } from 'lucide-react';
import { ComponentCard } from '@/components/ComponentCard';
import { EmptyLibrary } from '@/components/EmptyLibrary';
import { easeOut } from '@/lib/motion';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { pluralize } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  allComponents,
  getCategory,
  getCategorySummaries,
  getComponentsByCategory,
  getRecentComponents,
  searchComponents,
} from '@/registry';

type SortOrder = 'name' | 'recent';

const sortOptions: Array<{ value: SortOrder; label: string }> = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'recent', label: 'Recently added' },
];

export function ComponentsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = getCategory(params.get('category') ?? '');
  const sort: SortOrder = params.get('sort') === 'recent' ? 'recent' : 'name';
  useDocumentTitle(category?.label ?? 'Components');

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const scope = category ? getComponentsByCategory(category.id) : allComponents;
  const results = query
    ? searchComponents(query, scope) // ranked by relevance
    : sort === 'recent'
      ? getRecentComponents(Infinity).filter((entry) => scope.includes(entry))
      : [...scope].sort((a, b) => a.name.localeCompare(b.name));

  const filters = getCategorySummaries().filter((summary) => summary.count > 0);

  return (
    <div>
      <PageHeader
        eyebrow={
          category ? (
            <>
              <Link to="/components">Components</Link>
              <ChevronRight aria-hidden />
              <span>{category.label}</span>
            </>
          ) : (
            'Library'
          )
        }
        title={category?.label ?? 'Components'}
        description={
          category?.description ??
          'Every component in the library. Open one to preview it live, copy its code, or grab an AI-ready prompt.'
        }
      />

      {allComponents.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2.5">
            <InputGroup className="h-11 max-w-md flex-1">
              <InputGroupInput
                type="search"
                placeholder={`Search ${pluralize(scope.length, 'component')}…`}
                aria-label="Search components"
                value={query}
                onChange={(event) => setParam('q', event.target.value || null)}
                className="[&::-webkit-search-cancel-button]:hidden"
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setParam('q', null)}>
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            <Select value={sort} onValueChange={(value) => setParam('sort', value === 'name' ? null : value)}>
              <SelectTrigger aria-label="Sort by" className="h-11! w-44 px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <FilterChip active={!category} count={allComponents.length} onClick={() => setParam('category', null)}>
              All
            </FilterChip>
            {filters.map((summary) => (
              <FilterChip
                key={summary.id}
                active={category?.id === summary.id}
                count={summary.count}
                onClick={() => setParam('category', summary.id)}
              >
                {summary.label}
              </FilterChip>
            ))}
          </div>

          <p className="mb-3.5 text-sm text-muted-foreground" role="status">
            {query ? `${pluralize(results.length, 'result')} for “${query}”` : pluralize(results.length, 'component')}
          </p>

          {results.length > 0 ? (
            // Filtering animates: leaving tiles shrink away and the rest glide into place.
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-5 gap-y-10">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((entry) => (
                  <motion.div
                    key={entry.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                  >
                    <ComponentCard entry={entry} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Empty className="rounded-[2rem] bg-card">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>No matching components</EmptyTitle>
                <EmptyDescription>Try a different search term, or clear the filters.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </>
      )}
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  count: number;
  onClick: () => void;
  children: string;
}

function FilterChip({ active, count, onClick, children }: FilterChipProps) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      aria-pressed={active}
      onClick={onClick}
      className="rounded-full pr-1.5 pl-3"
    >
      {children}
      <Badge
        variant="outline"
        className={cn(
          'h-5 min-w-5 bg-background px-1.5 text-muted-foreground tabular-nums',
          active && 'bg-primary-foreground/15 text-primary-foreground',
        )}
      >
        {count}
      </Badge>
    </Button>
  );
}
