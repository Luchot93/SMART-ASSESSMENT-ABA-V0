import { CheckCircle2, AlertCircle, XCircle, Lightbulb, Mic, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSectionConfig } from '@/utils/sectionConfig';
import type { Section, SectionKey } from '@/types';

interface ChecklistRowProps {
  sessionId: string;
  sectionKey: SectionKey;
  section: Section;
  index: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusIcon({
  state,
  isSupposition,
}: {
  state: Section['completionState'];
  isSupposition: boolean;
}) {
  if (isSupposition)
    return <Lightbulb size={16} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />;
  if (state === 'complete')
    return <CheckCircle2 size={16} style={{ color: 'var(--status-complete)', flexShrink: 0 }} />;
  if (state === 'partial')
    return <AlertCircle size={16} style={{ color: 'var(--status-partial)', flexShrink: 0 }} />;
  return <XCircle size={16} style={{ color: 'var(--status-missing)', flexShrink: 0 }} />;
}

function oneLiner(sectionKey: SectionKey, section: Section): string {
  // Demographics is a pre-interview form, not AI-drafted
  if (sectionKey === 'demographics') {
    if (section.completionState === 'complete')
      return 'Pre-filled from client record — ready for assessment.';
    if (section.completionState === 'partial')
      return 'Some required fields missing — complete before generating.';
    return 'Demographics not filled — complete before generating.';
  }
  if (section.completionState === 'empty')
    return 'No data collected — AI will skip this section.';
  const parts: string[] = [];
  if (section.transcript) parts.push('transcript');
  if (section.notes.trim()) parts.push('notes');
  if (section.indicators.some((i) => i.count > 0)) {
    const total = section.indicators.reduce((s, i) => s + i.count, 0);
    parts.push(`${total} indicator${total !== 1 ? 's' : ''}`);
  }
  if (parts.length === 0) return 'Data captured.';
  return `Ready — ${parts.join(' + ')} captured.`;
}

const COMPLETION_TINT: Record<Section['completionState'], string> = {
  complete: 'rgba(52,211,153,0.04)',
  partial:  'rgba(251,191,36,0.04)',
  empty:    'transparent',
};

const COMPLETION_BORDER: Record<Section['completionState'], string> = {
  complete: '1px solid rgba(52,211,153,0.18)',
  partial:  '1px solid rgba(251,191,36,0.18)',
  empty:    '1px solid var(--border-subtle)',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ChecklistRow = ({ sessionId, sectionKey, section, index }: ChecklistRowProps) => {
  const navigate = useNavigate();
  const config = getSectionConfig(sectionKey);

  const handleClick = () => {
    navigate(`/assessments/${sessionId}/interview?expand=${sectionKey}`);
  };

  const hasTranscript = !!section.transcript;
  const hasNotes = section.notes.trim().length > 0;

  return (
    <button
      onClick={handleClick}
      className="group w-full rounded-xl px-4 py-3.5 text-left transition-all duration-150"
      style={{
        minHeight: 48,
        background: COMPLETION_TINT[section.completionState],
        border: COMPLETION_BORDER[section.completionState],
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.filter = 'brightness(0.97)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.filter = 'none';
      }}
    >
      <div className="flex items-center gap-3">
        {/* Index number */}
        <span
          className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-semibold"
          style={{
            background: 'var(--surface-elevated)',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {index}
        </span>

        {/* Status icon */}
        <StatusIcon state={section.completionState} isSupposition={!!config.isSupposition} />

        {/* Title + summary */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {config.title}
          </p>
          <p className="truncate text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            {oneLiner(sectionKey, section)}
          </p>
        </div>

        {/* Channel badges */}
        <div className="flex flex-none items-center gap-1.5">
          {hasTranscript && sectionKey !== 'demographics' && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: 'rgba(52,211,153,0.1)',
                color: 'var(--accent-teal)',
                border: '1px solid var(--accent-teal-border)',
              }}
            >
              <Mic size={9} />
              rec
            </span>
          )}
          {hasNotes && sectionKey !== 'demographics' && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: 'var(--surface-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <FileText size={9} />
              notes
            </span>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight
          size={14}
          style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
          className="transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
};

export default ChecklistRow;
