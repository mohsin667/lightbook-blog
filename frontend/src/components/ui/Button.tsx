import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  children?: ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-surface border-border-strong text-ink hover:bg-surface-tint hover:border-ink-soft',
  primary: 'bg-coral border-coral text-coral-deep hover:bg-[#ff7d61] hover:border-[#ff7d61]',
  ghost: 'bg-transparent border-transparent text-ink hover:bg-surface-tint',
  danger: 'bg-danger-light border-danger text-danger-deep hover:bg-danger-light',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  md: 'px-4.5 py-[10px] text-[15px] rounded-lg',
  sm: 'px-[14px] py-[6px] text-[13px] rounded-md',
};

export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 border font-display font-semibold whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
