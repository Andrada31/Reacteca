import { Layers, RefreshCw, Rocket, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollTimeline } from './ScrollTimeline';

const steps = [
  {
    label: 'Phase 1',
    icon: <Search />,
    title: 'Explore the problem',
    description: 'We sit down with your team, walk through the current process and agree on what success looks like.',
  },
  {
    label: 'Phase 2',
    icon: <Layers />,
    title: 'Shape the solution',
    description: 'Sketches turn into a clickable prototype, reviewed together until every flow feels obvious.',
  },
  {
    label: 'Phase 3',
    icon: <Rocket />,
    title: 'Build and ship',
    description: 'Short, focused cycles with a working release at the end of each one, tested against real use.',
  },
  {
    label: 'Phase 4',
    icon: <RefreshCw />,
    title: 'Measure and refine',
    description: 'We watch how it performs, keep what works and tune the rest, then hand over everything you need.',
  },
];

export default function Demo() {
  return (
    // Container queries (@4xl:), so the columns follow the space the section has, not the viewport.
    <div className="@container w-full">
      <section className="mx-auto grid max-w-5xl gap-14 py-10 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] @4xl:gap-20">
        <div className="flex flex-col items-start gap-5 @4xl:sticky @4xl:top-24 @4xl:self-start">
          <h2 className="text-4xl font-bold tracking-[-0.035em]">How it works</h2>
          <p className="max-w-md text-lg text-muted-foreground">
            From the first conversation to a product in use, in four steps your team can follow along with.
          </p>
          <Button size="lg" className="px-5">
            Book an intro call
          </Button>
        </div>
        <ScrollTimeline steps={steps} />
      </section>
    </div>
  );
}
