import type { ReactNode } from 'react';

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-[0.87em] bg-surface-tint border border-border text-coral px-1.5 py-0.5 rounded-[5px]">
      {children}
    </code>
  );
}
