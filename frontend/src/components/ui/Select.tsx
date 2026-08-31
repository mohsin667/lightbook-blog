import type { SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, id, className = '', children, ...rest }: SelectProps) {
  const field = (
    <select
      id={id}
      className={`w-full px-[14px] py-[12px] rounded-lg border border-border-strong bg-surface text-ink outline-none focus:border-coral ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
  if (!label) return field;
  return (
    <div>
      <label htmlFor={id} className="block font-display font-semibold text-[13.5px] mb-1.5 text-ink-soft">
        {label}
      </label>
      {field}
    </div>
  );
}
