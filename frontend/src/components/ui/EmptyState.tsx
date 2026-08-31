import type { ComponentType, ReactNode } from 'react';

export interface EmptyStateProps {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  children: ReactNode;
}

export function EmptyState({ icon: Icon, children }: EmptyStateProps) {
  return (
    <div className="text-center py-[60px] px-5 text-ink-soft flex flex-col items-center gap-3">
      <Icon size={32} strokeWidth={1.5} />
      <p className="m-0">{children}</p>
    </div>
  );
}
