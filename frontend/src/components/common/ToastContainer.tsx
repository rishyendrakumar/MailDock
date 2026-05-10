import { useToast } from '../../context/ToastContext';
import { X } from 'lucide-react';
import clsx from 'clsx';

const typeStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 rounded-lg border shadow-md text-sm min-w-56 max-w-sm animate-fade-in',
            typeStyles[t.type]
          )}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="shrink-0 hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
