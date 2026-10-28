import { useState } from 'react';
import { Bell, Bookmark, Compass, House, MessageCircle, Search, Settings, User } from 'lucide-react';
import { Dock } from './Dock';

const pages = [
  { id: 'home', label: 'Home', hint: 'Feed', icon: House },
  { id: 'explore', label: 'Explore', hint: 'Discover', icon: Compass },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'notifications', label: 'Notifications', hint: '4 new', icon: Bell },
  { id: 'messages', label: 'Messages', hint: '2 unread', icon: MessageCircle },
  { id: 'saved', label: 'Saved', hint: 'Collection', icon: Bookmark },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Demo() {
  const [active, setActive] = useState('home');

  return (
    <Dock
      activeId={active}
      items={pages.map(({ icon: Icon, ...page }) => ({
        ...page,
        icon: <Icon />,
        onSelect: () => setActive(page.id),
      }))}
    />
  );
}
