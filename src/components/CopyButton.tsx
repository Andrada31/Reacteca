import type { ComponentProps } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCopy } from '@/hooks/useCopy';
import { cn } from '@/lib/utils';

interface CopyButtonProps extends Pick<ComponentProps<typeof Button>, 'variant' | 'size' | 'className'> {
  /** Text to copy, or a function that produces it on click. */
  value: string | (() => string);
  label?: string;
  copiedLabel?: string;
  /** Show the label next to the icon instead of as a tooltip. */
  showLabel?: boolean;
}

export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied!',
  showLabel = false,
  variant = 'ghost',
  size,
  className,
}: CopyButtonProps) {
  const { copied, copy } = useCopy();
  const tinted = variant === 'ghost' || variant === 'outline';

  const button = (
    <Button
      variant={variant}
      size={size ?? (showLabel ? 'sm' : 'icon-sm')}
      aria-label={showLabel ? undefined : label}
      className={className}
      onClick={() => copy(typeof value === 'function' ? value() : value)}
    >
      <span className="relative grid size-4 place-items-center" aria-hidden>
        <Copy className={cn('absolute transition-all duration-200', copied && 'scale-50 opacity-0')} />
        <Check
          className={cn(
            'absolute transition-all duration-200',
            copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
            tinted && 'text-emerald-500',
          )}
        />
      </span>
      {showLabel && <span>{copied ? copiedLabel : label}</span>}
    </Button>
  );

  return (
    <>
      {showLabel ? (
        button
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{copied ? copiedLabel : label}</TooltipContent>
        </Tooltip>
      )}
      <span className="sr-only" role="status">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  );
}
