import { SpotlightCarousel } from './SpotlightCarousel';

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`;

const slides = [
  {
    image: photo('1522071820081-009f0129c71c'),
    alt: 'A team working together on laptops around a table',
    title: 'Team Workspace',
    description: 'Shared boards, quick handovers and one place to see what everyone is working on this week.',
    tags: ['Slack', 'Notion'],
  },
  {
    image: photo('1494412574643-ff11b0a5c1c3'),
    alt: 'An aerial view of a busy container port',
    title: 'Logistics Planner',
    description: 'Plans routes, tracks every shipment and flags delays before they reach your customers.',
    tags: ['Telegram', 'Python'],
  },
  {
    image: photo('1551288049-bebda4e38f71'),
    alt: 'An analytics dashboard with charts on a monitor',
    title: 'Insights Studio',
    description: 'Turns raw numbers into clear weekly reports, with the trends worth acting on called out.',
    tags: ['SQL', 'Sheets'],
  },
  {
    image: photo('1556761175-5973dc0f32e7'),
    alt: 'A speaker presenting to a seated audience in a bright office',
    title: 'Pitch Coach',
    description: 'Rehearse with realistic practice sessions and get tailored notes before the real meeting.',
    tags: ['Zoom', 'CRM'],
  },
  {
    image: photo('1581091226825-a6a2a5aee158'),
    alt: 'An engineer at a laptop in a hardware lab',
    title: 'Lab Assistant',
    description: 'Logs test runs, compares results against spec and drafts the summary for your review.',
    tags: ['Jupyter', 'GitHub'],
  },
];

export default function Demo() {
  return (
    <div className="@container flex w-full flex-col items-center justify-center gap-10 py-14">
      <div className="flex max-w-2xl flex-col items-center gap-3 px-4 text-center">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Templates</p>
        <h2 className="text-3xl font-bold tracking-[-0.035em] text-balance @xl:text-4xl">Start from something that already works</h2>
        <p className="text-lg text-muted-foreground">Ready-made setups you can adapt to your team, saving the first few weeks of work.</p>
      </div>
      <SpotlightCarousel slides={slides} defaultIndex={1} aria-label="Templates" />
    </div>
  );
}
