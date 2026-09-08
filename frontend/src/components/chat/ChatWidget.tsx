import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import refreshAPI from '../../api/refreshAPI';
import { useAppSelector } from '../../app/hooks';

interface ChatSource {
  title: string;
  slug: string;
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  sources?: ChatSource[];
  suggestions?: string[];
}

const INITIAL_MESSAGE: ChatMessage = {
  role: 'bot',
  text: "Hi! I'm the lightbook assistant. Ask me anything about the posts on this blog.",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const categories = useAppSelector((s) => s.categories.list);
  // Slugs the last answer was based on — sent with the next message so a
  // follow-up ("who wrote it?") that doesn't independently retrieve
  // anything can fall back to the post(s) already being discussed.
  const lastSourcesRef = useRef<string[]>([]);

  // Suggestions for the very first (static) greeting are built client-side
  // from categories already loaded in Redux — no extra API call needed.
  // Suggestions attached to a real backend reply (e.g. after "hi") come
  // from the server instead, since those reflect categories with actual
  // published posts.
  const initialSuggestions = categories.slice(0, 3).map((c) => `What can you tell me about ${c.name}?`);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    // Cloudflare's inference is fast enough that responses can beat the
    // "Typing…" bubble to the screen — wait for both the request and this
    // minimum delay so the indicator is always visible, not just a flash.
    const MIN_TYPING_MS = 500;
    const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_TYPING_MS));

    try {
      const [res] = await Promise.all([
        refreshAPI('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, previous_sources: lastSourcesRef.current }),
        }),
        minDelay,
      ]);

      if (res.status === 429) {
        lastSourcesRef.current = [];
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: "You've asked a lot of questions in a short time — give it a minute and try again." },
        ]);
        return;
      }

      if (!res.ok) {
        lastSourcesRef.current = [];
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: 'Something went wrong — please try again in a moment.' },
        ]);
        return;
      }

      const data = await res.json();
      lastSourcesRef.current = (data.sources ?? []).map((s: ChatSource) => s.slug);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.answer, sources: data.sources, suggestions: data.suggestions },
      ]);
    } catch {
      lastSourcesRef.current = [];
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: "Couldn't reach the server — check your connection and try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[340px] max-w-[calc(100vw-3rem)] h-[460px] flex flex-col bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-tint">
            <div className="flex items-center gap-2">
              <Bot size={17} strokeWidth={1.75} className="text-coral" />
              <span className="font-display font-bold text-sm text-ink">Ask lightbook</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-ink-soft hover:text-ink"
            >
              <X size={17} strokeWidth={1.75} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2.5">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`max-w-[85%] flex flex-col gap-1.5 rounded-xl px-3 py-2 text-[13.5px] leading-[1.5] ${
                  message.role === 'user'
                    ? 'self-end bg-coral text-coral-deep'
                    : 'self-start bg-surface-tint text-ink'
                }`}
              >
                {message.text}
                {message.sources && message.sources.length > 0 && (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-border">
                    {message.sources.map((source) => (
                      <Link
                        key={source.slug}
                        to={`/post/${source.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-[12px] font-display font-semibold text-coral hover:underline"
                      >
                        {source.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {!isTyping && (() => {
              const last = messages[messages.length - 1];
              const suggestions =
                messages.length === 1 ? initialSuggestions : last.role === 'bot' ? last.suggestions ?? [] : [];
              return suggestions.length > 0 ? (
                <div className="self-start flex flex-wrap gap-1.5 max-w-[95%]">
                  {suggestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSend(question)}
                      className="text-[12px] font-display font-semibold text-ink bg-surface-tint border border-border rounded-full px-3 py-1.5 hover:border-coral hover:text-coral transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
            {isTyping && (
              <div className="self-start bg-surface-tint text-ink-soft rounded-xl px-3 py-2 text-[13.5px]">
                Typing…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 border-t border-border">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a post…"
              className="flex-1 bg-surface-tint border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft outline-none focus:border-coral"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-coral text-coral-deep border border-coral hover:bg-[#ff7d61] hover:border-[#ff7d61] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-coral border border-coral text-coral-deep hover:bg-[#ff7d61] hover:border-[#ff7d61] transition-colors"
      >
        {isOpen ? <X size={22} strokeWidth={1.75} /> : <MessageCircle size={22} strokeWidth={1.75} />}
      </button>
    </div>
  );
}
