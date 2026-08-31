import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = '', ...rest }: InputProps) {
  const field = (
    <input
      id={id}
      className={`app-input w-full px-[14px] py-[12px] rounded-lg border border-border-strong bg-surface text-ink outline-none focus:border-coral ${className}`}
      {...rest}
    />
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
