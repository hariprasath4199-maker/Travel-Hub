import { cn } from '@/src/lib/utils';
import { ROLE_LABELS, type UserRole } from '@/src/visaApi';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  EMPLOYEE: 'bg-sky-100 text-sky-800',
  MANAGER: 'bg-purple-100 text-purple-800',
  HRBP: 'bg-emerald-100 text-emerald-800',
  EXECUTIVE: 'bg-indigo-100 text-indigo-800',
  FINANCE: 'bg-amber-100 text-amber-800',
  VENDOR: 'bg-pink-100 text-pink-800',
  // Legacy roles for workflow history display
  HR_ADMIN: 'bg-emerald-100 text-emerald-800',
  COST_CENTRE_OWNER: 'bg-amber-100 text-amber-800',
  APPLICANT: 'bg-sky-100 text-sky-800',
  EVP: 'bg-indigo-100 text-indigo-800',
};

const ROLE_SHORT_LABELS: Record<string, string> = {
  ADMIN: 'ADM',
  EMPLOYEE: 'EMP',
  MANAGER: 'MGR',
  HRBP: 'HR',
  EXECUTIVE: 'EXEC',
  FINANCE: 'FIN',
  VENDOR: 'VND',
  HR_ADMIN: 'HR',
  COST_CENTRE_OWNER: 'CCO',
  APPLICANT: 'EMP',
  EVP: 'EXEC',
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
      <span className="hidden sm:inline">{ROLE_LABELS[role as UserRole] || role}</span>
      <span className="inline sm:hidden">{ROLE_SHORT_LABELS[role] || role}</span>
    </span>
  );
}
