/* eslint-disable react-refresh/only-export-components */
/**
 * Toast system — context + provider + hook + visual component.
 *
 * Usage anywhere in the tree:
 *   const toast = useToast();
 *   toast.success('Saved');
 *   toast.action('Section un-approved', 'Undo', handleUndo);
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number; // ms
  action?: { label: string; fn: () => void };
}

interface ToastContextValue {
  addToast: (item: Omit<ToastItem, 'id'>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── useToast hook ────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  const { addToast } = ctx;
  return {
    success: (msg: string) =>
      addToast({ type: 'success', message: msg, duration: 4000 }),
    info: (msg: string) =>
      addToast({ type: 'info',    message: msg, duration: 4000 }),
    warning: (msg: string) =>
      addToast({ type: 'warning', message: msg, duration: 4000 }),
    error: (msg: string) =>
      addToast({ type: 'error',   message: msg, duration: 4000 }),
    action: (msg: string, label: string, fn: () => void) =>
      addToast({ type: 'info', message: msg, duration: 6000, action: { label, fn } }),
  };
}

// ─── Visual constants ─────────────────────────────────────────────────────────

const BORDER: Record<ToastType, string> = {
  success: 'var(--status-complete)',
  info:    'var(--accent-teal)',
  warning: 'var(--status-partial)',
  error:   'var(--status-missing)',
};

function ToastIcon({ type }: { type: ToastType }) {
  const color = BORDER[type];
  const sz = 16;
  if (type === 'success') return <CheckCircle2 size={sz} style={{ color, flexShrink: 0 }} />;
  if (type === 'warning') return <AlertCircle  size={sz} style={{ color, flexShrink: 0 }} />;
  if (type === 'error')   return <XCircle      size={sz} style={{ color, flexShrink: 0 }} />;
  return                         <Info         size={sz} style={{ color, flexShrink: 0 }} />;
}

// ─── Single toast ─────────────────────────────────────────────────────────────

interface SingleToastProps {
  item: ToastItem;
  onRemove: (id: string) => void;
}

function SingleToast({ item, onRemove }: SingleToastProps) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => onRemove(item.id), 210);
  }, [exiting, item.id, onRemove]);

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, item.duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss, item.duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
        borderLeft: `3px solid ${BORDER[item.type]}`,
        borderRadius: 8,
        boxShadow: 'var(--shadow-elevated)',
        overflow: 'hidden',
        minWidth: 280,
        maxWidth: 360,
        animation: exiting
          ? 'toast-exit 200ms ease-in forwards'
          : 'toast-enter 250ms ease-out forwards',
      }}
    >
      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
        <ToastIcon type={item.type} />

        <span
          style={{
            flex: 1,
            fontSize: 13,
            color: 'var(--text-primary)',
            lineHeight: 1.45,
            fontFamily: "'Instrument Sans', system-ui, sans-serif",
          }}
        >
          {item.message}
        </span>

        {item.action && (
          <button
            onClick={() => { item.action!.fn(); dismiss(); }}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--accent-teal)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              padding: '2px 4px',
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
            }}
          >
            {item.action.label}
          </button>
        )}

        <button
          onClick={dismiss}
          aria-label="Dismiss notification"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 2,
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar — shrinks left→right over duration */}
      <div
        style={{
          height: 2,
          background: BORDER[item.type],
          transformOrigin: 'left',
          animationName: 'toast-progress',
          animationDuration: `${item.duration}ms`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
        }}
      />
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [{ ...item, id }, ...prev].slice(0, 3)); // max 3, newest first
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            pointerEvents: toasts.length ? 'auto' : 'none',
          }}
          aria-label="Notifications"
        >
          {toasts.map((t) => (
            <SingleToast key={t.id} item={t} onRemove={removeToast} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
