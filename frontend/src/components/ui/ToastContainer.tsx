import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { dismissToast, type ToastItem } from '../../features/toast/toastSlice';

export function ToastContainer() {
  const toasts = useAppSelector((s) => s.toast.toasts);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <ToastPill key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastPill({ toast }: { toast: ToastItem }) {
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => setVisible(false), 2100);
    const remove = setTimeout(() => dispatch(dismissToast(toast.id)), 2500);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [toast.id, dispatch]);

  const Icon = toast.icon ?? Check;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-5 py-3 font-display font-semibold text-ink transition-opacity ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <Icon size={16} strokeWidth={1.75} />
      <span>{toast.message}</span>
    </div>
  );
}
