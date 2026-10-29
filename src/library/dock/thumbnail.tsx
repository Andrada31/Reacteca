import { useEffect, useState } from 'react';
import { Bell, Bookmark, Compass, House, MessageCircle, Search, Settings, User } from 'lucide-react';
import { Dock } from './Dock';

const items = [
  { id: 'home', label: 'Home', icon: <House /> },
  { id: 'explore', label: 'Explore', icon: <Compass /> },
  { id: 'search', label: 'Search', icon: <Search /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell /> },
  { id: 'messages', label: 'Messages', icon: <MessageCircle /> },
  { id: 'saved', label: 'Saved', icon: <Bookmark /> },
  { id: 'profile', label: 'Profile', icon: <User /> },
  { id: 'settings', label: 'Settings', icon: <Settings /> },
];

/** How long each state holds, in ms, counting its own animation: folding away, then unfurling. */
const closedFor = 1200;
const openFor = 2000;

/**
 * The library tile. While the tile is hovered the dock folds into its menu button and unfurls again, on a
 * loop; on leave it opens and stays open. It's controlled through `open`, so focus never moves.
 */
export default function Thumbnail({ active }: { active: boolean }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!active) return;
    let timer = 0;
    const toggle = (next: boolean) => {
      setOpen(next);
      timer = window.setTimeout(() => toggle(!next), next ? openFor : closedFor);
    };
    timer = window.setTimeout(() => toggle(false), 150);
    return () => {
      window.clearTimeout(timer);
      setOpen(true);
    };
  }, [active]);

  return (
    <div className="flex items-center justify-center px-6">
      <Dock items={items} activeId="home" open={open} sound={false} />
    </div>
  );
}
