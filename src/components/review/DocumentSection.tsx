import { Info } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import type { SectionKey, Section } from '@/types';
import type { SectionConfig } from '@/utils/sectionConfig';
import { ConflictFlag } from './ConflictFlag';
import { InlineEditor } from './InlineEditor';
import { ActionRow } from './ActionRow';

interface DocumentSectionProps {
  sessionId: string;
  sectionKey: SectionKey;
  config: SectionConfig;
}

// ─── State → visual mappings ──────────────────────────────────────────────────

function effectiveBorder(s: Section): { color: string; borderStyle: string } {
  if (s.approvalState === 'approved') return { color: '#34D399', borderStyle: 'solid' };
  if (s.approvalState === 'skipped')  return { color: '#94A3B8', borderStyle: 'solid' };
  if (s.approvalState === 'edited')   return { color: '#818CF8', borderStyle: 'solid' };
  if (s.draftState === 'blank')   return { color: '#F87171', borderStyle: 'dashed' };
  if (s.draftState === 'in_dev')  return { color: '#60A5FA', borderStyle: 'solid' };
  if (s.draftState === 'partial') return { color: '#FBBF24', borderStyle: 'solid' };
  return { color: '#00D4AE', borderStyle: 'solid' }; // drafted
}

interface BadgeStyle { label: string; color: string; bg: string }

function effectiveBadge(s: Section): BadgeStyle {
  if (s.approvalState === 'approved') return { label: 'APPROVED ✓', color: '#34D399', bg: 'rgba(52,211,153,0.12)' };
  if (s.approvalState === 'skipped')  return { label: 'SKIPPED →',  color: '#94A3B8', bg: 'rgba(148,163,184,0.1)'  };
  if (s.approvalState === 'edited')   return { label: 'EDITED ✏',   color: '#818CF8', bg: 'rgba(129,140,248,0.1)'  };
  if (s.draftState === 'blank')   return { label: 'BLANK',      color: '#F87171', bg: 'rgba(248,113,113,0.1)'  };
  if (s.draftState === 'in_dev')  return { label: 'IN DEV 💡',  color: '#60A5FA', bg: 'rgba(96,165,250,0.1)'   };
  if (s.draftState === 'partial') return { label: 'PARTIAL',    color: '#FBBF24', bg: 'rgba(251,191,36,0.1)'   };
  return { label: 'DRAFTED', color: '#00D4AE', bg: 'rgba(0,212,174,0.1)' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DocumentSection = ({ sessionId, sectionKey, config }: DocumentSectionProps) => {
  const section = useSessionStore(
    (s) => s.sessions.find((sess) => sess.id === sessionId)?.sections[sectionKey] ?? null,
  );

  if (!section) return null;

  const border  = effectiveBorder(section);
  const badge   = effectiveBadge(section);
  const isSkillAcq = sectionKey === 'skill_acquisitions';

  return (
    <div
      id={`doc-section-${sectionKey}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.08)',
        borderLeft: `4px ${border.borderStyle} ${border.color}`,
        borderRadius: 8,
        padding: '24px 28px',
        marginBottom: 16,
        transition: 'border-color 300ms ease',
      }}
    >
      {/* ── Section header ───────────────────────────────────────────── */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ letterSpacing: '0.1em', color: '#94A3B8' }}
          >
            Section {config.sectionNumber}
          </span>
          <h2
            className="text-[17px] font-semibold"
            style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", color: 'var(--text-clinical)' }}
          >
            {config.title}
          </h2>
        </div>

        {/* State badge */}
        <span
          className="flex-none rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase"
          style={{
            letterSpacing: '0.06em',
            fontFamily: "'Instrument Sans', system-ui, sans-serif",
            color: badge.color,
            background: badge.bg,
            border: `1px solid ${badge.color}33`,
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* ── Skill Acquisitions info callout ──────────────────────────── */}
      {isSkillAcq && (
        <div
          className="mb-4 flex items-start gap-2.5 rounded-lg px-3.5 py-2.5"
          style={{
            background: 'rgba(96,165,250,0.08)',
            border: '1px solid rgba(96,165,250,0.25)',
          }}
        >
          <Info size={13} style={{ color: '#60A5FA', flexShrink: 0, marginTop: 1 }} />
          <p className="text-[12px]" style={{ color: '#1E40AF' }}>
            This section was drafted from your notes. Skill Acquisitions UI is in development —
            review carefully before approving.
          </p>
        </div>
      )}

      {/* ── Conflict flag ─────────────────────────────────────────────── */}
      <ConflictFlag section={section} />

      {/* ── Content area ─────────────────────────────────────────────── */}
      {section.draftContent !== null ? (
        <InlineEditor
          sessionId={sessionId}
          sectionKey={sectionKey}
          draftContent={section.draftContent}
        />
      ) : (
        <div
          className="rounded-md px-4 py-6 text-center"
          style={{
            background: 'rgba(0,0,0,0.02)',
            border: '1px dashed rgba(0,0,0,0.12)',
          }}
        >
          <p className="text-[13px]" style={{ color: '#94A3B8' }}>
            {section.draftState === 'in_dev'
              ? 'This section is in development — AI draft not yet available.'
              : 'No data collected for this section.'}
          </p>
        </div>
      )}

      {/* ── Action row ───────────────────────────────────────────────── */}
      <ActionRow sessionId={sessionId} sectionKey={sectionKey} section={section} />
    </div>
  );
};

export default DocumentSection;
