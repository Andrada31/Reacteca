import { useEffect, useState } from 'react';
import { SpotlightCarousel } from './SpotlightCarousel';

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=75&auto=format&fit=crop`;

const slides = [
  { image: photo('1522071820081-009f0129c71c'), title: 'Team Workspace', description: 'One place to see what everyone is on.', tags: ['Slack'] },
  { image: photo('1494412574643-ff11b0a5c1c3'), title: 'Logistics Planner', description: 'Tracks every shipment and flags delays early.', tags: ['Python'] },
  { image: photo('1551288049-bebda4e38f71'), title: 'Insights Studio', description: 'Raw numbers into clear weekly reports.', tags: ['SQL'] },
  { image: photo('1556761175-5973dc0f32e7'), title: 'Pitch Coach', description: 'Rehearse before the real meeting.', tags: ['Zoom'] },
  { image: photo('1581091226825-a6a2a5aee158'), title: 'Lab Assistant', description: 'Logs test runs and drafts the summary.', tags: ['GitHub'] },
];

/** Where the spotlight rests: the second slide, so there's a faded slide on either side. */
const restingIndex = 1;

/**
 * The library tile. While the tile is hovered the carousel moves on a slide straight away, then every
 * 1.6s; on leave it glides back to where it started.
 */
export default function Thumbnail({ active }: { active: boolean }) {
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    if (!active) return;
    const first = window.setTimeout(() => setSteps(1), 150);
    const timer = window.setInterval(() => setSteps((count) => count + 1), 1600);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      setSteps(0);
    };
  }, [active]);

  return (
    <div className="flex items-center justify-center">
      {/* Laid out at 860px, where the side slides show, then scaled down to the 600px stage. */}
      <div className="w-[860px] shrink-0 scale-70">
        <SpotlightCarousel slides={slides} index={(restingIndex + steps) % slides.length} aria-label="Templates" />
      </div>
    </div>
  );
}
