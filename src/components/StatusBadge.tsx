import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ComponentStatus } from '@/registry';

const statusStyles: Record<ComponentStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-primary text-primary-foreground' },
  beta: { label: 'Beta', className: 'bg-muted text-foreground' },
  stable: { label: 'Stable', className: 'bg-muted text-muted-foreground' },
  deprecated: { label: 'Deprecated', className: 'bg-destructive/15 text-destructive' },
};

interface StatusBadgeProps {
  status: ComponentStatus;
  /** Hide the badge for stable components (keeps lists quiet). */
  hideStable?: boolean;
  className?: string;
}

export function StatusBadge({ status, hideStable = false, className }: StatusBadgeProps) {
  if (hideStable && status === 'stable') return null;
  const { label, className: tone } = statusStyles[status];
  return (
    <Badge variant="outline" className={cn(tone, className)}>
      {label}
    </Badge>
  );
}
