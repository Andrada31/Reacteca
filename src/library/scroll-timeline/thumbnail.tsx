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
 * The library tile: the timeline in its own scroll box, scrolled once on reveal so the connector fills
 * and the second step lights up.
 */
export default function Thumbnail() {
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scroller.current;
    const second = element?.querySelectorAll('li')[1];
    if (!element || !second) return;

    // Rest with the second step near the top, its marker past the activation line.
    const target = second.offsetTop - 56;
    if (reduce) {
      element.scrollTop = target;
      return;
    }
    const controls = animate(0, target, {
      delay: 0.6,
      duration: 1.4,
      ease: 'easeInOut',
      onUpdate: (top) => {
        element.scrollTop = top;
      },
    });
    return () => controls.stop();
  }, [reduce]);

  return (
    <div ref={scroller} className="relative overflow-hidden px-16 pt-14">
      <ScrollTimeline steps={steps} container={scroller} threshold={0.45} className="max-w-[26rem] pb-80" />
    </div>
  );
}
