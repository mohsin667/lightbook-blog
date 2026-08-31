import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'neutral' | 'outline' | 'danger';
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  neutral: 'bg-surface-tint text-ink border border-transparent',
  outline: 'bg-transparent text-ink-soft border border-border-strong',
  danger: 'bg-danger-light text-danger-deep border border-transparent',
};

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-[11px] py-[4px] text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
