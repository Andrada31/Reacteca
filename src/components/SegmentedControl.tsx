import { useId } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { indicatorSpring } from '@/lib/motion';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  /** Accessible name for the group. */
  label: string;
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  size?: 'sm' | 'default';
  /** Show icons only; labels become tooltips and accessible names. */
  iconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/**
 * A single-choice toggle group that can't be deselected. No borders: options
 * sit on a muted track and the selected one is a contrasting chip.
 */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  size = 'sm',
  iconOnly = false,
  fullWidth = false,
  className,
}: SegmentedControlProps<T>) {
  const indicatorId = `${useId()}-segment`;

  return (
    <ToggleGroup
      type="single"
      size={size}
      spacing={0.5}
      value={value}
      onValueChange={(next) => next && onChange(next as T)}
      aria-label={label}
      className={cn('rounded-full bg-muted p-1', fullWidth && 'w-full', className)}
    >
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => {
        const item = (
          <ToggleGroupItem
            key={optionValue}
            value={optionValue}
            aria-label={iconOnly ? optionLabel : undefined}
            className={cn(
              'relative isolate h-7 min-w-7 text-muted-foreground hover:bg-surface-3 hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground',
              fullWidth && 'flex-1',
              !iconOnly && 'px-3',
            )}
          >
            {/* The selected chip slides between options. */}
            {optionValue === value && (
              <motion.span
                layoutId={indicatorId}
                transition={indicatorSpring}
                className="absolute inset-0 -z-10 rounded-full bg-background"
              />
            )}
            {Icon && <Icon />}
            {!iconOnly && optionLabel}
          </ToggleGroupItem>
        );
        return iconOnly ? (
          <Tooltip key={optionValue}>
            <TooltipTrigger asChild>{item}</TooltipTrigger>
            <TooltipContent>{optionLabel}</TooltipContent>
          </Tooltip>
        ) : (
          item
        );
      })}
    </ToggleGroup>
  );
}
