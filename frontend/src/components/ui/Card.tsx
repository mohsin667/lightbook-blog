import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl ${padded ? 'p-[18px]' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
