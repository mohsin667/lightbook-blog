import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Builds a compact page list like [1, '…', 4, 5, 6, '…', 10] instead of
 * rendering every page number when there are many. */
function buildPageList(current: number, total: number): (number | '…')[] {
  const delta = 1;
  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  const pages: (number | '…')[] = [1];
  if (rangeStart > 2) pages.push('…');
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < total - 1) pages.push('…');
  if (total > 1) pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(page, totalPages);

  const pageButtonClass = (active: boolean) =>
    `min-w-[34px] h-[34px] px-2 rounded-lg font-display font-semibold text-sm transition-colors ${
      active ? 'bg-coral text-coral-deep' : 'text-ink-soft hover:bg-surface-tint hover:text-ink'
    }`;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
      <button
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="w-[34px] h-[34px] flex items-center justify-center rounded-lg text-ink-soft hover:bg-surface-tint hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronLeft size={16} strokeWidth={1.75} />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-ink-soft text-sm select-none">
            …
          </span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)} className={pageButtonClass(p === page)}>
            {p}
          </button>
        ),
      )}

      <button
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="w-[34px] h-[34px] flex items-center justify-center rounded-lg text-ink-soft hover:bg-surface-tint hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}
