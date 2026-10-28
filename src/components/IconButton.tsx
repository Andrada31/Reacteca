import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface IconButtonProps extends ComponentProps<typeof Button> {
  /** Accessible name, also shown as the tooltip. */
  label: string;
}

/** An icon-only button with a tooltip. Pass `asChild` to wrap a link. */
export function IconButton({ label, variant = 'ghost', size = 'icon-sm', ...props }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size={size} aria-label={label} {...props} />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
