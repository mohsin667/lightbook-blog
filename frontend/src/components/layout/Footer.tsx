import { PenLine } from 'lucide-react';

export function Footer() {
  return (
    <footer className="text-center py-10 px-5 text-ink-soft text-[13.5px] border-t border-border mt-5 flex items-center justify-center gap-2">
      <PenLine size={14} strokeWidth={1.75} />
      lightbook.info — a place to put things down
    </footer>
  );
}
