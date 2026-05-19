import { Flag, FileText } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { getSectionConfig } from '@/utils/sectionConfig';
import type { SectionKey } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parseLines(transcript: string) {
  return transcript
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const bcbaMatch = /^BCBA:\s*/i.exec(line);
      const caregiverMatch = /^CAREGIVER:\s*/i.exec(line);
      if (bcbaMatch) return { speaker: 'BCBA' as const, text: line.slice(bcbaMatch[0].length) };
      if (caregiverMatch) return { speaker: 'CAREGIVER' as const, text: line.slice(caregiverMatch[0].length) };
      return { speaker: null, text: line };
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TranscriptPanelProps {
  sessionId: string;
  sectionKey: SectionKey;
  transcript: string | null;
  isFlagged: boolean;
  isVisible: boolean;
}

export const TranscriptPanel = ({
  sessionId,
  sectionKey,
  transcript,
  isFlagged,
  isVisible,
}: TranscriptPanelProps) => {
  const config = getSectionConfig(sectionKey);
  const flagTranscript = useSessionStore((s) => s.flagTranscript);
  const updateSectionNotes = useSessionStore((s) => s.updateSectionNotes);
  const section = useSessionStore(
    (s) => s.sessions.find((sess) => sess.id === sessionId)?.sections[sectionKey] ?? null,
  );

  if (!transcript) return null;

  const duration = section?.recordingDurationSeconds ?? 0;
  const lines = parseLines(transcript);

  const handlePushToNotes = () => {
    const currentNotes = section?.notes ?? '';
    const formatted = lines
      .map((l) => (l.speaker ? `${l.speaker}: ${l.text}` : l.text))
      .join('\n');
    const separator = currentNotes.trim() ? '\n\n— Transcript —\n' : '— Transcript —\n';
    updateSectionNotes(sessionId, sectionKey, currentNotes + separator + formatted);
  };

  return (
    <div
      className="overflow-hidden"
      style={{
        maxHeight: isVisible ? 600 : 0,
        opacity: isVisible ? 1 : 0,
        transition: 'max-height 250ms ease-out, opacity 200ms ease-out',
      }}
      aria-hidden={!isVisible}
    >
      <div
        className="flex flex-col gap-0 rounded-lg overflow-hidden"
        style={{
          background: 'var(--surface-app)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* ── Flagged banner ───────────────────────────────────── */}
        {isFlagged && (
          <div
            className="flex items-center justify-between px-4 py-2 text-[12px] font-medium"
            style={{
              background: 'rgba(245,158,11,0.1)',
              borderBottom: '1px solid rgba(245,158,11,0.2)',
              color: '#F59E0B',
            }}
          >
            <span>🚩 FLAGGED — AI will deprioritize this transcript</span>
            <button
              onClick={() => flagTranscript(sessionId, sectionKey, false)}
              className="text-[11px] font-normal underline underline-offset-2"
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              Remove flag
            </button>
          </div>
        )}

        {/* ── Header ───────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}
          >
            🎙 Transcript — {config.title}
            {duration > 0 && ` (recorded ${formatDuration(duration)})`}
          </span>
        </div>

        {/* ── Lines ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 px-4 py-4">
          {lines.map((line, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              {line.speaker && (
                <span
                  className="text-[10px] font-semibold uppercase"
                  style={{
                    letterSpacing: '0.07em',
                    color:
                      line.speaker === 'BCBA' ? 'var(--accent-teal)' : 'var(--text-tertiary)',
                  }}
                >
                  {line.speaker}
                </span>
              )}
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {line.text}
              </p>
            </div>
          ))}
        </div>

        {/* ── Footer actions ───────────────────────────────────── */}
        <div
          className="flex items-center gap-1 px-4 py-2.5"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={() => flagTranscript(sessionId, sectionKey, !isFlagged)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors duration-150"
            style={{
              color: isFlagged ? '#F59E0B' : 'var(--text-tertiary)',
              background: isFlagged ? 'rgba(245,158,11,0.1)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Flag size={11} fill={isFlagged ? 'currentColor' : 'none'} />
            {isFlagged ? 'Flagged' : 'Flag inaccuracy'}
          </button>

          <button
            onClick={handlePushToNotes}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors duration-150"
            style={{
              color: 'var(--text-tertiary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
            }}
          >
            <FileText size={11} />
            Push to notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptPanel;
