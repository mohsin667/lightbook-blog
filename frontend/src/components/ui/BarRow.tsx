export interface BarRowProps {
  label: string;
  count: number;
  pct: number;
}

export function BarRow({ label, count, pct }: BarRowProps) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5 last:mb-0">
      <div className="w-20 text-[13px] font-display font-bold truncate">{label}</div>
      <div className="flex-1 h-2 bg-surface-tint rounded-full overflow-hidden">
        <div className="h-full bg-coral rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-6 text-right text-[13px] font-display font-bold">{count}</div>
    </div>
  );
}
