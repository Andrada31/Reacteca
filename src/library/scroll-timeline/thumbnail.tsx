import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { Layers, RefreshCw, Rocket, Search } from 'lucide-react';
import { ScrollTimeline } from './ScrollTimeline';

const steps = [
  { label: 'Phase 1', icon: <Search />, title: 'Explore the problem', description: 'Walk through the current process together.' },
  { label: 'Phase 2', icon: <Layers />, title: 'Shape the solution', description: 'A clickable prototype, reviewed until it feels obvious.' },
  { label: 'Phase 3', icon: <Rocket />, title: 'Build and ship', description: 'Short cycles, each ending in a working release.' },
  { label: 'Phase 4', icon: <RefreshCw />, title: 'Measure and refine', description: 'Keep what works and tune the rest.' },
];

/**
 * The library tile: the timeline in its own scroll box. While the tile is hovered it scrolls down so the
 * connector fills and the second step lights up; on leave it scrolls back to the top.
 */
export default function Thumbnail({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scroller.current;
    const second = element?.querySelectorAll('li')[1];
    if (!element || !second) return;

    // Hovered, it rests with the second step near the top, its marker past the activation line.
    const target = active ? second.offsetTop - 56 : 0;
    if (reduce) {
      element.scrollTop = target;
      return;
    }
    // Starts from wherever it is, so leaving mid-scroll turns straight back.
    const controls = animate(element.scrollTop, target, {
      delay: active ? 0.15 : 0,
      duration: active ? 1.2 : 0.8,
      ease: 'easeInOut',
      onUpdate: (top) => {
        element.scrollTop = top;
      },
    });
    return () => controls.stop();
  }, [active, reduce]);

  return (
    <div ref={scroller} className="relative overflow-hidden px-16 pt-14">
      <ScrollTimeline steps={steps} container={scroller} threshold={0.45} className="max-w-[26rem] pb-80" />
    </div>
  );
}
