import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CommentFormProps {
  onSubmit: (text: string) => void;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <div className="flex gap-2.5">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Add a comment"
        className="flex-1 px-3.5 py-2.5 rounded-2xl border-2 border-border-strong bg-transparent text-ink outline-none focus:border-coral"
      />
      <Button variant="primary" onClick={handleSubmit}>
        <MessageCircle size={15} strokeWidth={1.75} />
        Post
      </Button>
    </div>
  );
}
