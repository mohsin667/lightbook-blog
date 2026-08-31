import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface CodeBlockProps {
  lang: string;
  code: string;
}

export function CodeBlock({ lang, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="bg-surface border border-border rounded-[10px] overflow-hidden my-[22px]">
      <div className="flex items-center justify-between px-3.5 py-2 bg-surface-tint border-b border-border">
        <span className="font-mono font-semibold text-[11.5px] uppercase tracking-wider text-ink-soft">
          {lang || 'plaintext'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-ink-soft text-xs font-semibold px-2 py-1 rounded-md hover:bg-surface hover:text-ink"
        >
          {copied ? <Check size={13} strokeWidth={1.75} /> : <Copy size={13} strokeWidth={1.75} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="m-0 px-4.5 py-4 overflow-x-auto">
        <code className="font-mono text-[13.5px] leading-[1.65]">{code}</code>
      </pre>
    </div>
  );
}
