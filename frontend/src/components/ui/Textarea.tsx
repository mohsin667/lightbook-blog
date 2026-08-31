import type { Ref, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ label, id, className = '', ref, ...rest }: TextareaProps) {
  const field = (
    <textarea
      ref={ref}
      id={id}
      className={`w-full min-h-[160px] px-[14px] py-[12px] rounded-lg border border-border-strong bg-surface text-ink outline-none leading-[1.7] resize-y focus:border-coral ${className}`}
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
