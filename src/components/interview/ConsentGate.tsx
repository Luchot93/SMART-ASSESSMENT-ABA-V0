import { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';

interface ConsentGateProps {
  sessionId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONSENT_ITEMS = [
  'I have obtained verbal consent from the caregiver to record this session.',
  'The recording will only be used to draft the assessment and will not be shared.',
  'The caregiver may ask me to stop recording at any time.',
] as const;

export const ConsentGate = ({ sessionId, onConfirm, onCancel }: ConsentGateProps) => {
  const grantConsent = useSessionStore((s) => s.grantConsent);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);

  const allChecked = checked.every(Boolean);

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const handleConfirm = () => {
    grantConsent(sessionId);
    onConfirm();
  };

  return (
    /* ── Fixed backdrop ─────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      {/* ── Card ──────────────────────────────────────────────── */}
      <div
        className="relative flex w-full flex-col gap-6 rounded-xl p-7"
        style={{
          maxWidth: 440,
          background: 'var(--surface-elevated)',
          boxShadow: 'var(--shadow-modal)',
          animation: 'consent-enter 200ms ease-out both',
        }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 flex items-center justify-center rounded-md"
          style={{ width: 28, height: 28, color: 'var(--text-tertiary)', background: 'none', border: 'none' }}
          aria-label="Cancel"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
          <h2
            id="consent-title"
            className="text-[16px] font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Before you start recording
          </h2>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-4">
          {CONSENT_ITEMS.map((label, i) => (
            <label
              key={i}
              className="flex cursor-pointer items-start gap-3"
              onClick={() => toggle(i)}
            >
              {/* Custom checkbox */}
              <span
                className="mt-0.5 flex flex-none items-center justify-center rounded"
                style={{
                  width: 18,
                  height: 18,
                  background: checked[i] ? 'var(--accent-teal)' : 'var(--surface-card)',
                  border: checked[i] ? '1px solid var(--accent-teal)' : '1px solid var(--border-default)',
                  transition: 'background 150ms, border-color 150ms',
                  borderRadius: 4,
                }}
                role="checkbox"
                aria-checked={checked[i]}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') toggle(i); }}
              >
                {checked[i] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleConfirm}
            disabled={!allChecked}
            className="flex-1 rounded-lg text-[13px] font-semibold transition-all duration-200"
            style={{
              height: 40,
              background: allChecked ? 'var(--accent-teal)' : 'var(--surface-card)',
              color: allChecked ? '#fff' : 'var(--text-tertiary)',
              border: allChecked ? 'none' : '1px solid var(--border-default)',
              cursor: allChecked ? 'pointer' : 'not-allowed',
            }}
          >
            I confirm — Start Recording
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg px-4 text-[13px] transition-colors duration-150"
            style={{
              height: 40,
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes consent-enter {
          from { transform: scale(0.94); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ConsentGate;
