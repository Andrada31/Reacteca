import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
} from '@tabler/icons-react';
import { FloatingDock } from './FloatingDock';

const links = [
  { title: 'Home', icon: <IconHome />, href: '#' },
  { title: 'Products', icon: <IconTerminal2 />, href: '#' },
  { title: 'Components', icon: <IconNewSection />, href: '#' },
  { title: 'Changelog', icon: <IconExchange />, href: '#' },
  { title: 'Twitter', icon: <IconBrandX />, href: '#' },
  { title: 'GitHub', icon: <IconBrandGithub />, href: '#' },
];

/** Which icon the pointer comes to rest on. */
const restingIndex = 2;

/**
 * The library tile. Tiles are inert, so no real pointer reaches the dock: synthetic mouse events stand in
 * for one. While the tile is hovered it glides along the dock and rests on an icon, so it shows magnified
 * with its label; on leave the pointer leaves the dock and the icons settle back.
 */
export default function Thumbnail({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = ref.current?.querySelector('nav');
    const icons = nav?.querySelectorAll('a');
    const target = icons?.[restingIndex];
    if (!nav || !icons || !target || !active) return;

    const centre = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return rect.left + rect.width / 2;
    };
    const hover = () => target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    // A mouseout with nowhere to go: React fires mouseleave on the icon and the dock.
    const leave = () => target.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: null }));
    if (reduce) {
      hover();
      return leave;
    }

    // The icons shift as they grow, so the pointer homes in on the target's current centre every frame.
    const start = centre(icons[0]);
    const controls = animate(0, 1, {
      delay: 0.15,
      duration: 1.2,
      ease: 'easeInOut',
      onUpdate: (progress) => {
        const clientX = start + (centre(target) - start) * progress;
        nav.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX }));
      },
      onComplete: hover,
    });
    return () => {
      controls.stop();
      leave();
    };
  }, [active, reduce]);

  return (
    <div ref={ref} className="flex items-center justify-center">
      {/* Wide enough for the magnifying dock: below 36rem it becomes the menu button. */}
      <FloatingDock items={links} className="w-xl" />
    </div>
  );
}
