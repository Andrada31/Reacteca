import { useState, type ComponentType, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Blocks,
  Boxes,
  ChevronsUpDown,
  Component,
  Copy,
  Hammer,
  Inbox,
  Layers,
  Monitor,
  Moon,
  PencilRuler,
  Puzzle,
  ScanLine,
  Search,
  Shapes,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tablet,
} from "lucide-react";
import { GithubIcon } from "@/components/brand/GithubIcon";
import { Logo } from "@/components/brand/Logo";
import {
  DribbbleIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitchIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/brand/SocialIcons";
import { ComponentCard } from "@/components/ComponentCard";
import { EmptyLibrary } from "@/components/EmptyLibrary";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { easeOut, staggerItem } from "@/lib/motion";
import { useSearch } from "@/components/search/search-context";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { playKeySound } from "@/library/dock/key-sound";
import { modKey, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  allComponents,
  getCategorySummaries,
  getRecentComponents,
} from "@/registry";

export function HomePage() {
  useDocumentTitle();
  const recent = getRecentComponents(8);
  const categories = getCategorySummaries();

  return (
    <div className="flex flex-col gap-28 sm:gap-40">
      <section className="flex flex-col items-center pt-8 text-center sm:pt-16">
        <motion.h1
          className="max-w-6xl text-[2.5rem] leading-[1.05] font-bold tracking-[-0.045em] sm:text-6xl lg:text-[4.75rem]"
          variants={heroTitle}
          initial="hidden"
          animate="show"
        >
          <motion.span className="block" variants={heroLine}>
            Components <Tile icons={craftIcons} />
            crafted once.
          </motion.span>
          <motion.span
            className="block text-primary-display"
            variants={heroLine}
          >
            Ready to reuse <Tile icons={reuseIcons} accent />
            anywhere.
          </motion.span>
        </motion.h1>
        <motion.p
          className="mt-8 max-w-3xl text-lg text-balance text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.35 }}
        >
          The personal React component library.
          <br className="max-sm:hidden" />{" "}
          {pluralize(allComponents.length, "component")} across{" "}
          {categories.length} categories, each with a live preview, code and an
          AI prompt.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-2.5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.45 }}
        >
          <Button
            size="lg"
            className="h-11 px-5.5 text-[15px] font-semibold"
            asChild
          >
            <Link to="/components">Browse components</Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-11 px-5.5 text-[15px] font-semibold"
            asChild
          >
            <Link to="/getting-started">
              Getting started <ArrowRight />
            </Link>
          </Button>
        </motion.div>

        <Reveal delay={0.55} className="mt-20 w-full sm:mt-28">
          <ExplorePanel />
        </Reveal>
      </section>

      <section aria-labelledby="library-heading">
        <Reveal>
          <h2
            id="library-heading"
            className="text-center text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            One library
            <br />
            for every <span className="text-primary-display">workflow.</span>
          </h2>
        </Reveal>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureTile
            title="Preview"
            description="Live, in light or dark, at any width."
            visual={<PreviewMock />}
          />
          <FeatureTile
            title="Code"
            description="Every file, a usage example, install commands."
            visual={<CodeMock />}
          />
          <FeatureTile
            title="Prompt"
            description="Tuned to your stack, ready for any AI."
            visual={<PromptMock />}
          />
          <FeatureTile
            title="Search"
            description={`Find anything with ${modKey} K.`}
            visual={<SearchMock />}
          />
          <FeatureTile
            title="Light & dark"
            description="Every component, both themes."
            visual={<ThemeMock />}
          />
          <FeatureTile
            title="shadcn/ui"
            description="Built on primitives you already use."
            visual={<ElementsMock />}
          />
        </Stagger>
      </section>

      <section aria-labelledby="recent-heading">
        <Reveal className="flex items-end justify-between gap-4">
          <h2
            id="recent-heading"
            className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
          >
            Recently added
          </h2>
          {allComponents.length > 0 && (
            <Button variant="ghost" asChild>
              <Link to="/components?sort=recent">
                View all <ArrowRight />
              </Link>
            </Button>
          )}
        </Reveal>
        <div className="mt-8">
          {recent.length > 0 ? (
            <Stagger className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-5 gap-y-10">
              {recent.map((entry) => (
                <StaggerItem key={entry.slug}>
                  <ComponentCard entry={entry} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Reveal>
              <EmptyLibrary />
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}

const heroTitle: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const heroLine: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
};

/**
 * Opens a gap in the headline once its line has landed, pushing the words apart to make room for the tile.
 * A spring from rest pulls it open slowly, overshoots a little and snaps back, like an elastic.
 */
const tileGap: Variants = {
  hidden: { width: 0 },
  show: {
    width: "auto",
    transition: {
      type: "spring",
      visualDuration: 0.7,
      bounce: 0.4,
      delay: 0.8,
    },
  },
};

const tilePop: Variants = {
  hidden: { opacity: 0, scale: 0.3, rotate: -24 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 16, delay: 1.05 },
  },
};

type TileIcon = ComponentType<{ strokeWidth?: number }>;

/** Clicking a headline tile cycles its icon: crafting tools on the first line, places to reuse on the second. */
const craftIcons: TileIcon[] = [
  Boxes,
  Blocks,
  Puzzle,
  Layers,
  Shapes,
  Component,
  PencilRuler,
  Hammer,
];
const reuseIcons: TileIcon[] = [
  Sparkles,
  XIcon,
  InstagramIcon,
  YoutubeIcon,
  GithubIcon,
  LinkedinIcon,
  DribbbleIcon,
  TwitchIcon,
  FacebookIcon,
];

const headlineSpring = { type: "spring", stiffness: 420, damping: 16 } as const;

/**
 * An app-icon tile set inline with the headline text, sized in ems. The line first reads without it,
 * then splits open and the tile pops into the gap. Write it with a space before and none after.
 * Clicking it plays the dock's keyboard click and spins the current icon out and the next one in.
 * It's decorative (aria-hidden, out of the tab order), so this is a pointer-only flourish.
 */
function Tile({ icons, accent }: { icons: TileIcon[]; accent?: boolean }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const Icon = icons[index];

  return (
    <motion.span
      aria-hidden
      variants={reduceMotion ? undefined : tileGap}
      className="inline-block whitespace-pre"
    >
      {/* The entrance pop lives on this wrapper, so hover and tap below spring back without its delay. */}
      <motion.span
        variants={tilePop}
        className="mx-[0.04em] inline-block align-middle"
      >
        <motion.button
          type="button"
          tabIndex={-1}
          onClick={() => {
            playKeySound();
            setIndex((current) => (current + 1) % icons.length);
          }}
          whileHover={{ rotate: -8, scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          transition={headlineSpring}
          className={cn(
            "grid size-[0.84em] cursor-pointer place-items-center rounded-[0.24em] [&_svg]:size-[0.42em]",
            accent
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
          )}
        >
          <AnimatePresence initial={false}>
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.3, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.3, rotate: 90 }}
              transition={headlineSpring}
              className="col-start-1 row-start-1 grid place-items-center"
            >
              <Icon strokeWidth={2.25} />
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.span>{" "}
    </motion.span>
  );
}

/** A working "app window" of the library: search plus big-text link columns, as on mobbin.com. */
function ExplorePanel() {
  const { openSearch } = useSearch();
  const categories = getCategorySummaries();
  const half = Math.ceil(categories.length / 2);

  return (
    <div className="w-full rounded-[2.5rem] bg-card p-2.5 text-left sm:p-10">
      <div className="rounded-[1.75rem] bg-background p-5 sm:p-8">
        <div className="flex items-center gap-4 sm:gap-8">
          <Logo showWordmark={false} />
          <div className="flex items-center gap-5 text-sm font-medium max-md:hidden">
            <Link to="/components">Components</Link>
            <Link
              to="/getting-started"
              className="text-muted-foreground hover:text-foreground"
            >
              Guide
            </Link>
          </div>
          <button
            type="button"
            onClick={openSearch}
            className="mx-auto flex h-11 w-full max-w-md items-center gap-3 rounded-full bg-muted px-4 text-sm text-muted-foreground transition-colors hover:bg-surface-3"
          >
            <Search className="size-4" aria-hidden />
            Search components…
            <KbdGroup className="ml-auto max-sm:hidden">
              <Kbd>{modKey}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </button>
          <span className="w-28 max-md:hidden" aria-hidden />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          <ExploreColumn title="Categories">
            {categories.slice(0, half).map((category) => (
              <CategoryLink
                key={category.id}
                id={category.id}
                label={category.label}
                count={category.count}
              />
            ))}
          </ExploreColumn>
          <ExploreColumn
            title={<span className="max-lg:invisible">More categories</span>}
          >
            {categories.slice(half).map((category) => (
              <CategoryLink
                key={category.id}
                id={category.id}
                label={category.label}
                count={category.count}
              />
            ))}
          </ExploreColumn>
          <ExploreColumn title="Views">
            {["Preview", "Code", "Prompt"].map((view) => (
              <ExploreLink key={view} to="/getting-started#use-a-component">
                {view}
              </ExploreLink>
            ))}
            <li>
              <button
                type="button"
                onClick={openSearch}
                className={exploreItemClass}
              >
                Search
              </button>
            </li>
          </ExploreColumn>
          <ExploreColumn title="Built with">
            {[
              ["React 19", "https://react.dev"],
              ["shadcn/ui", "https://ui.shadcn.com"],
              ["Tailwind CSS", "https://tailwindcss.com"],
              ["Framer Motion", "https://motion.dev"],
            ].map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={exploreItemClass}
                >
                  {label}
                </a>
              </li>
            ))}
          </ExploreColumn>
        </div>
      </div>
    </div>
  );
}

const exploreItemClass =
  "text-lg font-medium tracking-tight transition-colors hover:text-primary-strong sm:text-xl";

function ExploreColumn({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{title}</p>
      <ul className="mt-3 flex flex-col gap-1">{children}</ul>
    </div>
  );
}

function ExploreLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <Link to={to} className={exploreItemClass}>
        {children}
      </Link>
    </li>
  );
}

function CategoryLink({
  id,
  label,
  count,
}: {
  id: string;
  label: string;
  count: number;
}) {
  return (
    <li>
      <Link
        to={`/components?category=${id}`}
        className={cn(exploreItemClass, count === 0 && "text-muted-foreground")}
      >
        {label}
        {count > 0 && (
          <sup className="ml-1 text-xs font-semibold text-primary-strong">
            {count}
          </sup>
        )}
      </Link>
    </li>
  );
}

interface FeatureTileProps {
  title: string;
  description: string;
  visual: ReactNode;
}

const featureTile: Variants = { ...staggerItem, hover: { y: -6 } };
const featureVisual: Variants = { hover: { y: -14 } };
const tileSpring = { type: "spring", stiffness: 300, damping: 24 } as const;

function FeatureTile({ title, description, visual }: FeatureTileProps) {
  return (
    <motion.article
      variants={featureTile}
      whileHover="hover"
      transition={tileSpring}
      className="flex h-[22rem] flex-col items-center overflow-hidden rounded-[2rem] bg-card pt-8 text-center"
    >
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 px-6 text-sm text-muted-foreground">{description}</p>
      <motion.div
        aria-hidden
        variants={featureVisual}
        transition={tileSpring}
        className="mt-auto -mb-3.5 flex w-full justify-center px-8"
      >
        {visual}
      </motion.div>
    </motion.article>
  );
}

/* Monochrome mini-illustrations. Each is a white panel rising from the bottom of its tile. */

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-64 rounded-t-[1.25rem] bg-background p-3.5 pb-9",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PreviewMock() {
  return (
    <Panel>
      <div className="flex items-center justify-between text-muted-foreground [&_svg]:size-3.5">
        <span className="flex gap-2">
          <Monitor className="text-foreground" />
          <Tablet />
          <Smartphone />
        </span>
        <Moon />
      </div>
      <div className="mt-3 grid h-28 place-items-center rounded-xl bg-card">
        <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
          Get started
        </span>
      </div>
    </Panel>
  );
}

function CodeMock() {
  const lines: Array<[number, string[]]> = [
    [0, ["--syntax-keyword", "--syntax-plain", "--syntax-string"]],
    [0, ["--syntax-keyword", "--syntax-function", "--syntax-punctuation"]],
    [12, ["--syntax-tag", "--syntax-attr", "--syntax-string"]],
    [12, ["--syntax-tag", "--syntax-punctuation"]],
    [0, ["--syntax-punctuation"]],
  ];
  const widths = [34, 52, 44];
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] text-muted-foreground">
          Button.tsx
        </span>
        <Copy className="size-3.5 text-muted-foreground" />
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        {lines.map(([indent, tokens], line) => (
          <div
            key={line}
            className="flex gap-1.5"
            style={{ paddingLeft: indent }}
          >
            {tokens.map((color, index) => (
              <span
                key={index}
                className="h-1.5 rounded-full"
                style={{ width: widths[index], background: `var(${color})` }}
              />
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PromptMock() {
  return (
    <Panel>
      <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-muted-foreground">
        <Sparkles className="size-3.5 text-foreground" /> prompt.md
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <span className="h-1.5 w-2/5 rounded-full bg-foreground" />
        <span className="h-1.5 w-11/12 rounded-full bg-muted" />
        <span className="h-1.5 w-3/4 rounded-full bg-muted" />
      </div>
      <span className="mt-5 ml-auto flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
        <Copy className="size-3" /> Copy prompt
      </span>
    </Panel>
  );
}

function SearchMock() {
  return (
    <Panel className="pt-4">
      <div className="flex h-9 items-center gap-2 rounded-full bg-muted px-3 text-[11px] text-muted-foreground">
        <Search className="size-3.5" /> Search components…
        <span className="ml-auto rounded bg-background px-1.5 text-[10px]">
          {modKey} K
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-1">
        {["Pill Button", "Pricing Card", "Command Menu"].map((label, index) => (
          <span
            key={label}
            className={cn(
              "rounded-lg px-3 py-1.5 text-left text-xs font-medium",
              index === 0 && "bg-muted",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </Panel>
  );
}

function ThemeMock() {
  return (
    <div className="relative h-40 w-full max-w-64">
      <div className="light absolute bottom-0 left-0 h-36 w-40 rounded-t-[1.25rem] bg-background p-4">
        <Sun className="size-4 text-foreground" />
        <span className="mt-6 block w-fit rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
          Button
        </span>
      </div>
      <div className="dark absolute right-0 bottom-0 h-40 w-40 rounded-t-[1.25rem] bg-background p-4">
        <Moon className="size-4 text-foreground" />
        <span className="mt-8 block w-fit rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
          Button
        </span>
      </div>
    </div>
  );
}

function ElementsMock() {
  const icons = [Inbox, ScanLine, Star, ChevronsUpDown];
  return (
    <div className="mb-12 flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-full bg-background p-1.5">
        {icons.map((Icon, index) => (
          <span
            key={index}
            className={cn(
              "grid size-10 place-items-center rounded-full",
              index === 1 && "bg-muted",
            )}
          >
            <Icon className="size-4.5" />
          </span>
        ))}
      </div>
      <span className="grid size-[3.25rem] place-items-center rounded-full bg-background">
        <Search className="size-4.5" />
      </span>
    </div>
  );
}
