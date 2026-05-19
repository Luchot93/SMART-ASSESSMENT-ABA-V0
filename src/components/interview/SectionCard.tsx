import { ChevronDown, Lightbulb, Mic, PenLine } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { getSectionConfig } from '@/utils/sectionConfig';
import type { Section, SectionKey } from '@/types';
import { BehavioralIndicators } from './BehavioralIndicators';
import { DemographicsForm } from './DemographicsForm';
import { FreeTextNotes } from './FreeTextNotes';
import { GuidedPrompts } from './GuidedPrompts';
import { SkillAcquisitionsPanel } from './SkillAcquisitionsPanel';

// ─── Completion dot — single element with CSS transitions ────────────────────

function CompletionDot({ state }: { state: Section['completionState'] }) {
  const bg =
    state === 'complete' ? 'var(--status-complete)' :
    state === 'partial'  ? 'var(--status-partial)'  : 'transparent';

  const shadow =
    state === 'complete' ? '0 0 6px rgba(52,211,153,0.35)' :
    state === 'partial'  ? '0 0 6px rgba(251,191,36,0.35)'  : 'none';

  const borderColor = state === 'empty' ? 'var(--border-default)' : 'transparent';

  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        flexShrink: 0,
        background: bg,
        border: `1.5px solid ${borderColor}`,
        boxShadow: shadow,
        transition: 'background 300ms, border-color 300ms, box-shadow 300ms',
      }}
    />
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  sessionId: string;
  sectionKey: SectionKey;
  isExpanded: boolean;
  onToggle: () => void;
}

// Generous max-height for animation — larger sections (demographics) need more
const BODY_MAX_HEIGHT = 1600;

export const SectionCard = ({ sessionId, sectionKey, isExpanded, onToggle }: SectionCardProps) => {
  const config = getSectionConfig(sectionKey);
  const section = useSessionStore(
    (s) => s.sessions.find((sess) => sess.id === sessionId)?.sections[sectionKey] ?? null,
  );

  if (!section) return null;

  const { completionState, transcript, notes } = section;

  /* ── Left-border color ─────────────────────────────────────── */
  const borderLeftColor =
    isExpanded
      ? 'var(--accent-teal)'
      : completionState === 'complete'
        ? 'var(--status-complete)'
        : completionState === 'partial'
          ? 'var(--status-partial)'
          : 'transparent';

  const hasTranscript = transcript !== null;
  const hasNotes = notes.trim().length > 0;

  const expandedBg = 'linear-gradient(135deg, var(--accent-teal-muted) 0%, var(--surface-card) 55%)';

  return (
    <div
      id={`section-${sectionKey}`}
      className="rounded-xl"
      style={{
        background: isExpanded ? expandedBg : 'var(--surface-card)',
        borderTop: `1px solid ${isExpanded ? 'var(--accent-teal-border)' : 'var(--border-subtle)'}`,
        borderRight: `1px solid ${isExpanded ? 'var(--accent-teal-border)' : 'var(--border-subtle)'}`,
        borderBottom: `1px solid ${isExpanded ? 'var(--accent-teal-border)' : 'var(--border-subtle)'}`,
        borderLeft: `3px solid ${borderLeftColor}`,
        boxShadow: isExpanded
          ? '0 0 0 1px var(--accent-teal-border), var(--shadow-card)'
          : 'var(--shadow-card)',
        transition: 'background 200ms, border-color 200ms, box-shadow 200ms',
        overflow: 'hidden',
      }}
    >
      {/* ── Header (always visible) ────────────────────────────── */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span
          className="flex-none tabular-nums text-[11px]"
          style={{ color: 'var(--text-tertiary)', minWidth: 14 }}
        >
          {config.sectionNumber}
        </span>

        <span className="flex-1 text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {config.title}
        </span>

        {config.isSupposition ? (
          <Lightbulb size={12} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
        ) : (
          <CompletionDot state={completionState} />
        )}

        <span className="flex flex-none items-center gap-1.5">
          {hasTranscript && <Mic    size={12} style={{ color: 'var(--status-complete)', flexShrink: 0 }} />}
          {hasNotes       && <PenLine size={12} style={{ color: 'var(--text-tertiary)',   flexShrink: 0 }} />}
        </span>

        {/* Animated chevron */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease-out',
            color: 'var(--text-tertiary)',
            flexShrink: 0,
          }}
        >
          <ChevronDown size={15} />
        </span>
      </button>

      {/* ── Animated body ──────────────────────────────────────── */}
      <div
        className="section-body"
        style={{
          maxHeight: isExpanded ? BODY_MAX_HEIGHT : 0,
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div
          className="flex flex-col gap-5 px-5 pb-6 pt-3"
          style={{ borderTop: '1px solid var(--accent-teal-border)' }}
        >
          {sectionKey === 'demographics' && <DemographicsForm sessionId={sessionId} />}

          {sectionKey === 'skill_acquisitions' && <SkillAcquisitionsPanel sessionId={sessionId} />}

          {sectionKey !== 'demographics' && sectionKey !== 'skill_acquisitions' && (
            <>
              <GuidedPrompts sessionId={sessionId} sectionKey={sectionKey} />
              <BehavioralIndicators sessionId={sessionId} sectionKey={sectionKey} />
              <FreeTextNotes sessionId={sessionId} sectionKey={sectionKey} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionCard;
