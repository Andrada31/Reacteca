/*
 * Adapted from the Floating Dock in Aceternity UI, by Manu Arora:
 * https://ui.aceternity.com/components/floating-dock
 */
import { useId, useRef, useState, type ComponentProps, type FocusEvent, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { PanelBottomOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FloatingDockItem {
  /** Accessible name, also shown in the label above the icon. */
  title: string;
  /** An icon, e.g. from lucide-react. SVGs inside are sized to fit. */
  icon: ReactNode;
  href: string;
}

export interface FloatingDockProps extends Omit<ComponentProps<'div'>, 'children'> {
  items: FloatingDockItem[];
  /** Classes for the magnifying dock shown in wide spaces. */
  desktopClassName?: string;
  /** Classes for the menu button shown in narrow spaces. */
  mobileClassName?: string;
}

export function FloatingDock({ items, desktopClassName, mobileClassName, className, ...props }: FloatingDockProps) {
  return (
    // A container, so the layout follows the space the dock has rather than the viewport. To pin it,
    // position this element (e.g. `fixed inset-x-0 bottom-6`), not the dock inside.
    <div className={cn('@container flex w-full justify-center', className)} {...props}>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </div>
  );
}

function FloatingDockMobile({ items, className }: { items: FloatingDockItem[]; className?: string }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <div className={cn('relative @xl:hidden', className)}>
      <AnimatePresence>
        {open && (
          <nav id={menuId} aria-label="Dock" className="absolute inset-x-0 bottom-full mb-2 flex flex-col items-center gap-2">
            {/* Items rise in from the bottom one by one, and leave from the top. */}
            {items.map((item, index) => (
              <motion.a
                key={item.title}
                href={item.href}
                aria-label={item.title}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : 10, transition: { delay: index * 0.05 } }}
                transition={{ delay: (items.length - 1 - index) * 0.05 }}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4"
              >
                {item.icon}
              </motion.a>
            ))}
          </nav>
        )}
      </AnimatePresence>
      <button
        type="button"
        aria-label={open ? 'Close dock' : 'Open dock'}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(!open)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <PanelBottomOpen className="size-5" />
      </button>
    </div>
  );
}

function FloatingDockDesktop({ items, className }: { items: FloatingDockItem[]; className?: string }) {
  const reduce = useReducedMotion();
  // The pointer's x position, or Infinity while it's away so every icon rests at its smallest.
  const pointerX = useMotionValue(Infinity);

  return (
    <nav
      aria-label="Dock"
      onMouseMove={reduce ? undefined : (event) => pointerX.set(event.clientX)}
      onMouseLeave={() => pointerX.set(Infinity)}
      className={cn('hidden h-16 items-end gap-4 rounded-2xl bg-card px-4 pb-3 @xl:flex', className)}
    >
      {items.map((item) => (
        <DockIcon key={item.title} pointerX={pointerX} {...item} />
      ))}
    </nav>
  );
}

/** How far from the pointer (px) an icon starts to grow, and the spring that smooths it. */
const reach = 150;
const growSpring = { mass: 0.1, stiffness: 150, damping: 12 };

function DockIcon({ pointerX, title, icon, href }: FloatingDockItem & { pointerX: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [labelShown, setLabelShown] = useState(false);

  // The pointer's distance from this icon's centre drives its size: 40px at rest, 80px right under it.
  const distance = useTransform(pointerX, (x) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return x - bounds.x - bounds.width / 2;
  });
  const size = useSpring(useTransform(distance, [-reach, 0, reach], [40, 80, 40]), growSpring);
  const iconSize = useSpring(useTransform(distance, [-reach, 0, reach], [20, 40, 20]), growSpring);

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={title}
      style={{ width: size, height: size }}
      onMouseEnter={() => setLabelShown(true)}
      onMouseLeave={() => setLabelShown(false)}
      // Keyboard focus only: a click focuses the link too, and the pointer already shows the label.
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        if (event.currentTarget.matches(':focus-visible')) setLabelShown(true);
      }}
      onBlur={() => setLabelShown(false)}
      className="group relative flex aspect-square shrink-0 items-center justify-center rounded-full bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <AnimatePresence>
        {labelShown && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, y: reduce ? 0 : 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: reduce ? 0 : 2, x: '-50%' }}
            className="pointer-events-none absolute -top-8 left-1/2 w-fit rounded-full bg-foreground px-2.5 py-1 text-xs font-medium whitespace-pre text-background"
          >
            {title}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span
        style={{ width: iconSize, height: iconSize }}
        className="flex items-center justify-center text-muted-foreground transition-colors group-hover:text-foreground [&_svg]:size-full"
      >
        {icon}
      </motion.span>
    </motion.a>
  );
}
