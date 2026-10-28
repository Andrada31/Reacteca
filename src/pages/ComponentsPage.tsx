import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Layers, LayoutGrid, Search, SearchX, X } from 'lucide-react';
import { EmptyLibrary } from '@/components/EmptyLibrary';
import { PageHeader } from '@/components/PageHeader';
import { PreviewCard } from '@/components/PreviewCard';
import { ComponentThumbnail } from '@/components/preview/ComponentThumbnail';
import { SegmentedControl, type SegmentOption } from '@/components/SegmentedControl';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { pluralize } from '@/lib/format';
import { easeOut } from '@/lib/motion';
import { cn } from '@/lib/utils';
import {
  allComponents,
  getCategory,
  getCategorySummaries,
  getComponentsByCategory,
  getRecentComponents,
  searchComponents,
  type CategorySummary,
} from '@/registry';

type View = 'grouped' | 'all';
type SortOrder = 'name' | 'recent';

const viewOptions: SegmentOption<View>[] = [
  { value: 'grouped', label: 'Grouped', icon: Layers },
  { value: 'all', label: 'All components', icon: LayoutGrid },
];

const sortOptions: Array<{ value: SortOrder; label: string }> = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'recent', label: 'Recently added' },
];

const ALL_CATEGORIES = 'all';

// Filtering animates: leaving cards shrink away and the rest glide into place.
const gridItem = {
  layout: true,
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.94 },
  transition: { duration: 0.3, ease: easeOut },
};

export function ComponentsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = getCategory(params.get('category') ?? '');
  const view: View = params.get('view') === 'all' ? 'all' : 'grouped';
  const sort: SortOrder = params.get('sort') === 'recent' ? 'recent' : 'name';
  useDocumentTitle(category?.label ?? 'Components');

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const summaries = getCategorySummaries();
  const groups = summaries.filter((summary) => summary.count > 0);
  // Categories show as cards until one is picked, "All components" is chosen or a search is typed.
  const grouped = view === 'grouped' && !category && !query;

  const scope = category ? getComponentsByCategory(category.id) : allComponents;
  const results = query
    ? searchComponents(query, scope) // ranked by relevance
    : sort === 'recent'
      ? getRecentComponents(Infinity).filter((entry) => scope.includes(entry))
      : [...scope].sort((a, b) => a.name.localeCompare(b.name));

  // When the listing changes from far down the page, bring its top back into view.
  const listingRef = useRef<HTMLDivElement>(null);
  const listingKey = `${category?.id ?? ''}:${grouped}`;
  const shownKey = useRef(listingKey);
  useEffect(() => {
    if (shownKey.current === listingKey) return;
    shownKey.current = listingKey;
    const listing = listingRef.current;
    if (listing && listing.getBoundingClientRect().top < 0) listing.scrollIntoView();
  }, [listingKey]);

  const EmptyIcon = query || !category ? SearchX : category.icon;

  return (
    <div>
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {category ? (
              <BreadcrumbLink asChild>
                <Link to="/components">Components</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Components</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={category?.label ?? 'Components'}
        description={
          category?.description ??
          'Every component in the library. Open one to preview it live, copy its code, or grab an AI-ready prompt.'
        }
      />

      {allComponents.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <div ref={listingRef}>
          <div className="mb-8 flex flex-wrap items-center gap-2.5">
            {category ? (
              <Button variant="secondary" className="h-10 px-4" asChild>
                <Link to="/components">
                  <ArrowLeft /> All categories
                </Link>
              </Button>
            ) : (
              <SegmentedControl
                label="View"
                value={view}
                options={viewOptions}
                onChange={(next) => setParam('view', next === 'all' ? next : null)}
                className="p-1.5"
              />
            )}
            <InputGroup className="h-10 min-w-56 flex-1 sm:ml-auto sm:max-w-sm">
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
            {/* The sidebar's stand-in on small screens. */}
            <Select
              value={category?.id ?? ALL_CATEGORIES}
              onValueChange={(next) => setParams(next === ALL_CATEGORIES ? {} : { category: next })}
            >
              <SelectTrigger aria-label="Category" className="h-10! w-44 px-4 lg:hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {summaries.map((summary) => (
                  <SelectItem key={summary.id} value={summary.id}>
                    {summary.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!grouped && (
              <Select value={sort} onValueChange={(value) => setParam('sort', value === 'name' ? null : value)}>
                <SelectTrigger aria-label="Sort by" className="h-10! w-44 px-4">
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
            )}
          </div>

          <div className="lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10">
            <aside className="max-lg:hidden">
              <CategoryNav summaries={summaries} activeId={category?.id} />
            </aside>

            <div>
              <p className="mb-3.5 text-sm text-muted-foreground" role="status">
                {grouped
                  ? `${pluralize(groups.length, 'category', 'categories')} · ${pluralize(allComponents.length, 'component')}`
                  : query
                    ? `${pluralize(results.length, 'result')} for “${query}”`
                    : pluralize(results.length, 'component')}
              </p>

              {grouped || results.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {grouped
                      ? groups.map((summary) => (
                          <motion.div key={`category:${summary.id}`} {...gridItem}>
                            <CategoryCard summary={summary} />
                          </motion.div>
                        ))
                      : results.map((entry) => (
                          <motion.div key={entry.slug} {...gridItem}>
                            <PreviewCard
                              to={`/components/${entry.slug}`}
                              title={entry.name}
                              subtitle={
                                category
                                  ? entry.description
                                  : [getCategory(entry.category)?.label, entry.description].filter(Boolean).join(' · ')
                              }
                              badge={<StatusBadge status={entry.status} hideStable />}
                            >
                              <ComponentThumbnail entry={entry} />
                            </PreviewCard>
                          </motion.div>
                        ))}
                  </AnimatePresence>
                </div>
              ) : (
                <Empty className="rounded-[2rem] bg-card">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <EmptyIcon />
                    </EmptyMedia>
                    <EmptyTitle>{query || !category ? 'No matching components' : `Nothing in ${category.label} yet`}</EmptyTitle>
                    <EmptyDescription>
                      {query ? 'Try a different search term.' : 'Components you add to this category show up here.'}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    {query ? (
                      <Button variant="outline" onClick={() => setParam('q', null)}>
                        Clear search
                      </Button>
                    ) : (
                      <Button variant="outline" asChild>
                        <Link to="/components">Browse all categories</Link>
                      </Button>
                    )}
                  </EmptyContent>
                </Empty>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** A category tile: its first component with a demo as the cover, and the component count. */
function CategoryCard({ summary }: { summary: CategorySummary }) {
  const entries = getComponentsByCategory(summary.id);
  const cover = entries.find((entry) => entry.hasDemo) ?? entries[0];

  return (
    <PreviewCard to={`/components?category=${summary.id}`} title={summary.label} subtitle={pluralize(summary.count, 'component')}>
      {cover && <ComponentThumbnail entry={cover} />}
    </PreviewCard>
  );
}

function CategoryNav({ summaries, activeId }: { summaries: CategorySummary[]; activeId?: string }) {
  return (
    // Pulled left so the labels line up with the page edge; the hover pills hang into the margin.
    <nav aria-labelledby="categories-heading" className="sticky top-24 -ml-4 max-h-[calc(100dvh-7rem)] overflow-y-auto p-1">
      <h2 id="categories-heading" className="px-3 pb-3 text-lg font-semibold tracking-tight">
        Categories
      </h2>
      <ul className="flex flex-col gap-0.5">
        {summaries.map((summary) => {
          const active = summary.id === activeId;
          return (
            <li key={summary.id}>
              <Link
                to={`/components?category=${summary.id}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-full px-3 py-1.5 text-[15px] text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
                  active && 'bg-muted font-medium text-foreground',
                )}
              >
                {summary.label}
                <span className="font-mono text-xs tabular-nums">{summary.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
