import { cn } from '@/src/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    icon?: LucideIcon;
  };
  footer?: {
    label: string;
    icon?: LucideIcon;
  };
  className?: string;
  variant?: 'default' | 'primary';
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  footer, 
  className,
  variant = 'default'
}: StatCardProps) {
  if (variant === 'primary') {
    return (
      <div className={cn("bg-primary-container p-6 rounded-2xl flex flex-col justify-center items-center text-center", className)}>
        <p className="text-on-primary-container font-label text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-on-primary-fixed flex items-center justify-center mb-1">
          <span className="text-on-primary-container font-bold text-lg">{value}</span>
        </div>
        <p className="text-on-primary-container text-xs font-medium">Compliance</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between min-h-[160px] shadow-sm", className)}>
      <div>
        <p className="text-on-surface-variant font-label text-sm font-medium">{title}</p>
        <h2 className="text-4xl font-extrabold font-headline text-on-surface mt-1">{value}</h2>
      </div>
      
      {trend && (
        <div className={cn(
          "flex items-center gap-2 text-sm font-semibold mt-4",
          trend.isPositive ? "text-tertiary" : "text-on-surface-variant"
        )}>
          {trend.icon && <trend.icon size={14} />}
          <span>{trend.value}</span>
        </div>
      )}

      {footer && (
        <div className="flex items-center gap-2 text-on-surface-variant text-sm mt-4">
          {footer.icon && <footer.icon size={14} />}
          <span>{footer.label}</span>
        </div>
      )}
    </div>
  );
}
