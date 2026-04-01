import { cn } from '@/src/lib/utils';
import { ROLE_LABELS, type UserRole } from '@/src/visaApi';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const ROLE_STYLES: Record<string, string> = {
  HR_ADMIN: 'bg-blue-100 text-blue-800',
  MANAGER: 'bg-purple-100 text-purple-800',
  COST_CENTRE_OWNER: 'bg-amber-100 text-amber-800',
  VENDOR: 'bg-orange-100 text-orange-800',
  APPLICANT: 'bg-cyan-100 text-cyan-800',
  EVP: 'bg-emerald-100 text-emerald-800',
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap',
        ROLE_STYLES[role] || 'bg-gray-100 text-gray-800',
        className,
      )}
    >
      {ROLE_LABELS[role as UserRole] || role}
    </span>
  );
}
