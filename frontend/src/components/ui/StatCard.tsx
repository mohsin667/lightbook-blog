export interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-4 text-left">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
      <div className="font-display text-[26px] font-bold mt-0.5">{value}</div>
    </div>
  );
}
