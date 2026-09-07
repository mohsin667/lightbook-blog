import { useState } from 'react';
import { X } from 'lucide-react';

export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

/**
 * Free-text tag entry. The backend does get-or-create by tag name, so this only
 * ever deals in plain strings — no ids, no pre-existing tag lookup required.
 */
export function TagInput({ tags, onChange, label = 'Tags' }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const name = draft.trim();
    if (!name) return;
    // case-insensitive dedupe, matching how the backend resolves tag names
    if (!tags.some((t) => t.toLowerCase() === name.toLowerCase())) {
      onChange([...tags, name]);
    }
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <label className="block font-display font-semibold text-[13.5px] mb-1.5 text-ink-soft">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5 rounded-lg border border-border bg-surface focus-within:border-coral">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-display font-semibold bg-surface-tint text-ink"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              title={`Remove ${tag}`}
              className="text-ink-soft hover:text-danger"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={tags.length ? 'Add another' : 'Add a tag and press enter'}
          className="flex-1 min-w-[140px] bg-transparent border-none outline-none text-ink placeholder:text-ink-soft"
        />
      </div>
      <p className="text-[12.5px] text-ink-soft mt-1.5">
        Press enter or comma to add. Tags are created automatically if they don't exist yet.
      </p>
    </div>
  );
}
