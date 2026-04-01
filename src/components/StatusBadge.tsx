import { cn } from '@/src/lib/utils';
import { RequestStatus } from '@/src/types';

interface StatusBadgeProps {
  status: RequestStatus | 'Compliant' | 'Pending Update';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    PENDING: 'bg-secondary-container text-on-secondary-container',
    APPROVED: 'bg-tertiary-container text-on-tertiary-container',
    DENIED: 'bg-error-container/20 text-on-error-container',
    Compliant: 'bg-tertiary-container text-on-tertiary-container',
    'Pending Update': 'bg-secondary-container text-on-secondary-container',
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider',
        styles[status as keyof typeof styles],
        className
      )}
    >
      {status}
    </span>
  );
}
