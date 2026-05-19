import { Check, ChevronDown, Mic, Square } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSessionStore } from '@/store/sessionStore';
import { getSectionConfig } from '@/utils/sectionConfig';
import { useRecording } from '@/hooks/useRecording';
import type { SectionKey } from '@/types';
import { ConsentGate } from './ConsentGate';

// ─── Timer formatter ─────────────────────────────────────────────────────────

function fmtTimer(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface RecordButtonProps {
  sessionId: string;
  sectionKey: SectionKey;
  /** Called when user clicks "Transcript ready" to toggle the panel */
  onTranscriptToggle?: () => void;
  /** Whether the transcript panel is currently shown (controls chevron direction) */
  isTranscriptVisible?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const RecordButton = ({
  sessionId,
  sectionKey,
  onTranscriptToggle,
  isTranscriptVisible = false,
}: RecordButtonProps) => {
  const config = getSectionConfig(sectionKey);

  const consentGranted = useSessionStore(
    (s) => s.sessions.find((sess) => sess.id === sessionId)?.consentGranted ?? false,
  );

  const { recordingState, startRecording, stopRecording, undoStop, isPendingStop, durationSeconds, error } =
    useRecording(sessionId, sectionKey);

  const [showConsent, setShowConsent] = useState(false);

  if (config.notApplicableForRecording) return null;

  // ── Click handler ──────────────────────────────────────────────────────────
  const handleClick = () => {
    if (recordingState === 'idle') {
      if (!consentGranted) {
        setShowConsent(true);
      } else {
        void startRecording();
      }
    } else if (recordingState === 'recording') {
      stopRecording();
    } else if (recordingState === 'transcript_ready') {
      onTranscriptToggle?.();
    }
    // 'saving': no action
  };

  // ── Visual config per state ────────────────────────────────────────────────
  const isIdle = recordingState === 'idle';
  const isRecording = recordingState === 'recording';
  const isSaving = recordingState === 'saving';
  const isReady = recordingState === 'transcript_ready';

  const btnStyle: React.CSSProperties = isRecording
    ? {
        background: 'var(--status-recording-bg)',
        border: '1px solid rgba(239,68,68,0.30)',
        color: 'var(--status-recording)',
      }
    : isSaving
      ? {
          background: 'var(--status-complete-bg)',
          border: '1px solid rgba(52,211,153,0.20)',
          color: 'var(--status-complete)',
        }
      : isReady
        ? {
            background: 'var(--accent-teal-muted)',
            border: '1px solid var(--accent-teal-border)',
            color: 'var(--accent-teal)',
          }
        : {
            // idle
            background: 'transparent',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
          };

  return (
    <>
      {/* ── Main button ──────────────────────────────────────── */}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleClick}
          disabled={isSaving}
          className="group flex flex-none items-center gap-2 rounded-lg px-2.5 text-[12px] font-medium transition-all duration-200"
          style={{
            height: 30,
            cursor: isSaving ? 'default' : 'pointer',
            ...btnStyle,
          }}
          onMouseEnter={(e) => {
            if (isIdle) {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--surface-elevated)';
              el.style.borderColor = 'var(--accent-teal)';
              el.style.color = 'var(--accent-teal)';
            }
          }}
          onMouseLeave={(e) => {
            if (isIdle) {
              const el = e.currentTarget as HTMLElement;
              Object.assign(el.style, btnStyle);
            }
          }}
          aria-label={
            isIdle ? 'Record this section' :
            isRecording ? 'Stop recording' :
            isSaving ? 'Saving recording' :
            isTranscriptVisible ? 'Hide transcript' : 'Show transcript'
          }
        >
          {/* Icon */}
          {isRecording ? (
            <Square size={10} fill="currentColor" style={{ flexShrink: 0 }} />
          ) : isSaving ? (
            <Check size={13} style={{ flexShrink: 0 }} />
          ) : (
            <Mic size={13} style={{ flexShrink: 0 }} />
          )}

          {/* Label */}
          {isIdle && <span>Record this section</span>}
          {isRecording && (
            <>
              {/* Heartbeat dot */}
              <span
                className="recording-heartbeat inline-block rounded-full"
                style={{ width: 6, height: 6, background: 'var(--status-recording)', flexShrink: 0 }}
              />
              {/* Timer */}
              <span className="tabular-nums" style={{ fontFamily: 'monospace' }}>
                {fmtTimer(durationSeconds)}
              </span>
              <span>Stop</span>
            </>
          )}
          {isSaving && <span>Recording saved</span>}
          {isReady && (
            <>
              <span>Transcript ready</span>
              <ChevronDown
                size={11}
                style={{
                  flexShrink: 0,
                  transform: isTranscriptVisible ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms',
                }}
              />
            </>
          )}
        </button>

        {/* ── Inline error ─────────────────────────────────────── */}
        {error && (
          <p
            className="max-w-[240px] text-right text-[11px] leading-snug"
            style={{ color: 'var(--status-recording)' }}
          >
            {error}
          </p>
        )}
      </div>

      {/* ── Consent gate ─────────────────────────────────────── */}
      {showConsent && (
        <ConsentGate
          sessionId={sessionId}
          onConfirm={() => {
            setShowConsent(false);
            void startRecording();
          }}
          onCancel={() => setShowConsent(false)}
        />
      )}

      {/* ── Undo-stop toast (fixed, bottom-right) ────────────── */}
      {isPendingStop &&
        createPortal(
          <div
            role="alert"
            aria-live="assertive"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-xl px-5 py-3.5 shadow-elevated"
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-default)',
              animation: 'consent-enter 200ms ease-out both',
            }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recording stopped
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Undo within 5 seconds to continue
              </span>
            </div>
            <button
              onClick={undoStop}
              className="rounded-lg px-4 text-[13px] font-semibold transition-all duration-150"
              style={{
                height: 34,
                background: 'var(--accent-teal)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Undo
            </button>
          </div>,
          document.body,
        )}

      <style>{`
        @keyframes consent-enter {
          from { transform: scale(0.94); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default RecordButton;
