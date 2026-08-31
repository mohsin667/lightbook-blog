import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Code, FileText, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { InlineCode } from '../components/post/InlineCode';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { postCreated, postUpdated, deletePost } from '../features/posts/postsSlice';
import { showToast } from '../features/toast/toastSlice';

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.list);
  const categories = useAppSelector((s) => s.categories.list);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editing = id ? posts.find((p) => p.id === id) : undefined;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [category, setCategory] = useState(editing?.category ?? categories[0]?.name ?? '');
  const [excerpt, setExcerpt] = useState(editing?.excerpt ?? '');
  const [image, setImage] = useState(editing?.image ?? `https://picsum.photos/seed/${Date.now()}/900/600`);
  const [content, setContent] = useState(editing?.content ?? '');

  const insertAtCursor = (before: string, after: string, placeholder: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      const pos = start + before.length + selected.length + after.length;
      ta.focus();
      ta.selectionStart = ta.selectionEnd = pos;
    });
  };

  const handleSave = (status: 'published' | 'draft') => {
    if (!title.trim()) {
      dispatch(showToast('Give your post a title'));
      return;
    }
    const input = {
      title: title.trim(),
      category,
      excerpt: excerpt.trim() || 'No excerpt yet.',
      content: content.trim() || 'Nothing written yet.',
      image: image.trim() || `https://picsum.photos/seed/${Date.now()}/900/600`,
      status,
    };
    if (editing) {
      dispatch(postUpdated({ id: editing.id, ...input }));
    } else {
      dispatch(postCreated(input));
    }
    dispatch(showToast(status === 'published' ? 'Post published' : 'Draft saved', Check));
    navigate(status === 'published' ? '/' : '/dashboard');
  };

  const handleDelete = () => {
    if (!editing) return;
    dispatch(deletePost(editing.id));
    dispatch(showToast('Post deleted', Trash2));
    navigate('/dashboard');
  };

  return (
    <div className="max-w-[680px] mx-auto px-6 pt-7">
      <h1 className="text-2xl font-display font-bold mb-5">{editing ? 'Edit post' : 'Write a new post'}</h1>

      <div className="mb-4.5">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give it a title" />
      </div>

      <div className="mb-4.5">
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-4.5">
        <Input
          label="Excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="One line that sums it up"
        />
      </div>

      <div className="mb-4.5">
        <Input
          label="Cover image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://…"
        />
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-border-strong mt-2.5 bg-surface-tint">
          {image && <img src={image} alt="" className="w-full h-full object-cover block" />}
        </div>
      </div>

      <div className="mb-4.5">
        <label className="block font-display font-semibold text-[13.5px] mb-1.5 text-ink-soft">Content</label>
        <div className="flex gap-2 mb-2">
          <Button type="button" size="sm" onClick={() => insertAtCursor('`', '`', 'code')}>
            <Code size={13} strokeWidth={1.75} />
            Inline code
          </Button>
          <Button type="button" size="sm" onClick={() => insertAtCursor('\n```js\n', '\n```\n', 'your code here')}>
            <Code size={13} strokeWidth={1.75} />
            Code block
          </Button>
        </div>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write freely. Leave a blank line between paragraphs."
        />
        <p className="text-[12.5px] text-ink-soft mt-1.5">
          Wrap a snippet in <InlineCode>`inline code`</InlineCode> for inline code, or fence a block with{' '}
          <InlineCode>```js</InlineCode> on its own line, your code, then <InlineCode>```</InlineCode> — put a blank
          line before and after it.
        </p>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        <Button variant="primary" onClick={() => handleSave('published')}>
          <Check size={16} strokeWidth={1.75} />
          Publish
        </Button>
        <Button onClick={() => handleSave('draft')}>
          <FileText size={16} strokeWidth={1.75} />
          Save as draft
        </Button>
        {editing && (
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={16} strokeWidth={1.75} />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
