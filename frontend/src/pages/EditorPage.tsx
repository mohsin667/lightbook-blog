import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Code, FileText, ImagePlus, Loader2, Sparkles, Trash2, X } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { InlineCode } from '../components/post/InlineCode';
import { TagInput } from '../components/post/TagInput';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { showToast } from '../features/toast/toastSlice';
import {
  createPosts, updatePost, publishPost, deletePost, getDrafts,
} from '../features/posts/createPostThunk';
import refreshAPI from '../api/refreshAPI';

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.list);
  const drafts = useAppSelector((s) => s.posts.drafts);
  const categories = useAppSelector((s) => s.categories.list);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);

  const editing = id ? [...posts, ...drafts].find((p) => p.id === id) : undefined;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // drafts aren't in the published list, so make sure they're fetched before
  // deciding the post can't be found
  useEffect(() => {
    if (id) dispatch(getDrafts());
  }, [dispatch, id]);

  // seed the form once, when the post being edited first becomes available
  useEffect(() => {
    if (!editing || loaded) return;
    setTitle(editing.title);
    setCategory(editing.category_id ?? '');
    setExcerpt(editing.excerpt);
    setImage(editing.cover_image_url ?? '');
    setContent(editing.content);
    setTags(editing.tags.map((t) => t.name));
    setLoaded(true);
  }, [editing, loaded]);

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

  const handleSave = async (status: 'published' | 'draft') => {
    if (!title.trim()) {
      dispatch(showToast('Give your post a title'));
      return;
    }

    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      // never submit the local blob: preview — only a finished S3 URL
      cover_image_url: image.startsWith('blob:') ? undefined : image || undefined,
      category_id: category || undefined,
      tags,
    };

    if (editing) {
      const result = await dispatch(updatePost({ id: editing.id, updates: payload }));
      if (updatePost.rejected.match(result)) {
        dispatch(showToast((result.payload as string) ?? 'Could not save changes'));
        return;
      }
      if (status === 'published' && editing.status !== 'published') {
        const published = await dispatch(publishPost(editing.id));
        if (publishPost.rejected.match(published)) {
          dispatch(showToast((published.payload as string) ?? 'Could not publish'));
          return;
        }
      }
      dispatch(showToast(status === 'published' ? 'Post published' : 'Changes saved', Check));
    } else {
      const result = await dispatch(
        createPosts({ ...payload, publish: status === 'published' }),
      );
      if (createPosts.rejected.match(result)) {
        dispatch(showToast((result.payload as string) ?? 'Could not save post'));
        return;
      }
      dispatch(showToast(status === 'published' ? 'Post published' : 'Draft saved', Check));
    }

    navigate(status === 'published' ? '/' : '/dashboard');
  };

  const handleGenerate = async () => {
    if (!title.trim() || generating) return;

    setGenerating(true);
    try {
      const res = await refreshAPI('/api/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        dispatch(showToast(body?.detail ?? 'Could not generate content right now'));
        return;
      }

      const data = await res.json();
      setContent(data.content);
      setExcerpt(data.excerpt);
      dispatch(showToast('Draft generated — review and edit before publishing', Sparkles));
    } catch {
      dispatch(showToast('Could not reach the server — please try again'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    const result = await dispatch(deletePost(editing.id));
    if (deletePost.rejected.match(result)) {
      dispatch(showToast((result.payload as string) ?? 'Could not delete post'));
      return;
    }
    dispatch(showToast('Post deleted', Trash2));
    navigate('/dashboard');
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      dispatch(showToast('Please choose an image file'));
      return;
    }

    const previewURL = URL.createObjectURL(file);
    setImage(previewURL);

    try {
      setUploading(true)
      const presignRes = await refreshAPI('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "filename": file.name, "content_type": file.type })
      })

      if (!presignRes.ok) throw new Error('presign failed');

      const { upload_url, file_url } = await presignRes.json();

      const putRes = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      })
      if (!putRes.ok) throw new Error('upload failed');

      setImage(file_url);
      URL.revokeObjectURL(previewURL);
      dispatch(showToast('Image uploaded successfully'));
    }
    catch (err) {
      // drop the unusable blob preview so it can never be submitted
      URL.revokeObjectURL(previewURL);
      setImage('');
      dispatch(showToast('Image upload failed'));
    }
    finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = ''; // allow re-selecting the same file later
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="max-w-[680px] mx-auto px-6 pt-7">
      <h1 className="text-2xl font-display font-bold mb-5">{editing ? 'Edit post' : 'Write a new post'}</h1>

      <div className="mb-4.5 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give it a title" />
        </div>
        <Button
          type="button"
          disabled={!title.trim() || generating}
          onClick={handleGenerate}
          title="Generate a draft from the title"
          className="h-[47px]"
        >
          <Sparkles size={15} strokeWidth={1.75} />
          {generating ? 'Generating…' : 'Generate with AI'}
        </Button>
      </div>

      <div className="mb-4.5">
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
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
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <div className="mb-4.5">
        <label className="block font-display font-semibold text-[13.5px] mb-1.5 text-ink-soft">Cover image</label>

        <input
          ref={uploadInput}
          name="upload-image"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {image && !uploading ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border group">
            <img src={image} alt="" className="w-full h-full object-cover block" />
            <div className="absolute inset-0 bg-bg/0 group-hover:bg-bg/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Button type="button" size="sm" onClick={() => uploadInput.current?.click()}>
                <ImagePlus size={14} strokeWidth={1.75} />
                Replace
              </Button>
              <Button type="button" size="sm" variant="danger" onClick={() => setImage('')}>
                <X size={14} strokeWidth={1.75} />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !uploading && uploadInput.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-center px-6 transition-colors ${uploading ? 'cursor-default border-border' : 'cursor-pointer'
              } ${isDragging ? 'border-coral bg-coral-light' : 'bg-surface-tint border-border hover:border-border-strong'
              }`}
          >
            {uploading ? (
              <>
                <Loader2 size={22} strokeWidth={1.75} className="text-ink-soft animate-spin" />
                <p className="text-sm font-display font-semibold text-ink m-0">Uploading…</p>
              </>
            ) : (
              <>
                <ImagePlus size={22} strokeWidth={1.75} className="text-ink-soft" />
                <p className="text-sm font-display font-semibold text-ink m-0">
                  Click to choose an image or drag and drop it here
                </p>
                <p className="text-[12.5px] text-ink-soft m-0">PNG, JPG or WEBP</p>
              </>
            )}
          </div>
        )}
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
        <Button variant="primary" disabled={uploading} onClick={() => handleSave('published')}>
          <Check size={16} strokeWidth={1.75} />
          {editing?.status === 'published' ? 'Save changes' : 'Publish'}
        </Button>
        <Button disabled={uploading} onClick={() => handleSave('draft')}>
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
