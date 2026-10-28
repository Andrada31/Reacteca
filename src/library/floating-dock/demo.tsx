import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
} from '@tabler/icons-react';
import { FloatingDock } from './FloatingDock';

// Aceternity UI's own demo items. The dock sizes and colours the icons, so they need no classes.
const links = [
  { title: 'Home', icon: <IconHome />, href: '#' },
  { title: 'Products', icon: <IconTerminal2 />, href: '#' },
  { title: 'Components', icon: <IconNewSection />, href: '#' },
  {
    title: 'Aceternity UI',
    icon: <img src="https://assets.aceternity.com/logo-dark.png" width={20} height={20} alt="Aceternity Logo" />,
    href: '#',
  },
  { title: 'Changelog', icon: <IconExchange />, href: '#' },
  { title: 'Twitter', icon: <IconBrandX />, href: '#' },
  { title: 'GitHub', icon: <IconBrandGithub />, href: '#' },
];

export default function Demo() {
  return (
    <div className="flex h-[35rem] w-full items-center justify-center">
      <FloatingDock
        mobileClassName="translate-y-20" // only for the demo: leaves room above for the opened menu
        items={links}
      />
    </div>
  );
}
