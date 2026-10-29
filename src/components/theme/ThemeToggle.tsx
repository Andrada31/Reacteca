import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/theme/theme-context';

const orbitSpring: Transition = { type: 'spring', bounce: 0.25, duration: 0.35 };

/**
 * One-click light/dark switch. The sun and moon orbit a point below the button
 * (one sets to the right as the other rises from the left), and the new theme
 * spreads across the page from the button.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = theme === 'dark' ? Moon : Sun;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative cursor-pointer overflow-hidden"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      onClick={(event) => {
        const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
        toggle({ x: left + width / 2, y: top + height / 2 });
      }}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={theme}
          className="absolute inset-0 grid place-items-center"
          style={{ transformOrigin: '50% 160%' }}
          initial={{ rotate: -80, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 80, opacity: 0 }}
          transition={orbitSpring}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
