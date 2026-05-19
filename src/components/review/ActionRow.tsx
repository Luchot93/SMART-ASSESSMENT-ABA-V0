import { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import type { Section, SectionKey } from '@/types';
import { RevertConfirm } from './RevertConfirm';

interface ActionRowProps {
  sessionId: string;
  sectionKey: SectionKey;
  section: Section;
}

export const ActionRow = ({ sessionId, sectionKey, section }: ActionRowProps) => {
  const setApprovalState = useSessionStore((s) => s.setApprovalState);
  const [showRevert, setShowRevert] = useState(false);
  const [approveScale, setApproveScale] = useState(false);

  const { approvalState, draftState, aiOriginalContent } = section;
  const isApproved  = approvalState === 'approved';
  const isSkipped   = approvalState === 'skipped';
  const isEdited    = approvalState === 'edited';
  const hasContent  = section.draftContent !== null;
  const canRevert   = aiOriginalContent !== null && isEdited;
  const showSkip    = (draftState === 'blank' || draftState === 'in_dev') && !isSkipped;

  const handleApprove = () => {
    setApproveScale(true);
    setTimeout(() => setApproveScale(false), 150);
    setApprovalState(sessionId, sectionKey, 'approved');
  };

  const handleUnapprove = () => {
    setApprovalState(sessionId, sectionKey, 'edited');
  };

  const handleSkip = () => {
    setApprovalState(sessionId, sectionKey, 'skipped');
  };

  if (showRevert) {
    return (
      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <RevertConfirm
          sessionId={sessionId}
          sectionKey={sectionKey}
          onCancel={() => setShowRevert(false)}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
      style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* REVERT TO AI — edited only */}
      {canRevert && (
        <button
          onClick={() => setShowRevert(true)}
          className="flex items-center gap-1 text-[11px] transition-colors duration-150"
          style={{ color: 'var(--text-clinical-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--status-missing)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-clinical-muted)';
          }}
        >
          <RotateCcw size={12} />
          Revert to AI
        </button>
      )}

      {/* SKIP — blank / in_dev */}
      {showSkip && (
        <button
          onClick={handleSkip}
          className="text-[11px] transition-colors duration-150"
          style={{ color: 'var(--text-clinical-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--status-missing)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-clinical-muted)';
          }}
        >
          → Skip
        </button>
      )}

      {/* UN-APPROVE — only when approved */}
      {isApproved && (
        <button
          onClick={handleUnapprove}
          className="text-[11px] transition-colors duration-150"
          style={{ color: 'var(--text-clinical-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--status-partial)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-clinical-muted)';
          }}
        >
          Un-approve
        </button>
      )}

      {/* APPROVE — not approved/skipped, has content or it's the normal state */}
      {!isApproved && !isSkipped && (hasContent || isEdited) && (
        <button
          onClick={handleApprove}
          className="flex w-full items-center justify-center gap-1.5 rounded-md transition-all duration-150 sm:w-auto sm:justify-start"
          style={{
            height: 32,
            paddingLeft: 12,
            paddingRight: 12,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'Instrument Sans', system-ui, sans-serif",
            background: 'var(--surface-document)',
            color: 'var(--text-clinical-muted)',
            border: '1px solid rgba(52,211,153,0.35)',
            cursor: 'pointer',
            transform: approveScale ? 'scale(0.95)' : 'scale(1)',
            borderRadius: 6,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.08)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(52,211,153,0.55)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-document)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(52,211,153,0.35)';
          }}
        >
          Approve
        </button>
      )}

      {/* APPROVED state display */}
      {isApproved && (
        <div
          className="flex items-center gap-1.5 rounded-md"
          style={{
            height: 32,
            paddingLeft: 12,
            paddingRight: 12,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'Instrument Sans', system-ui, sans-serif",
            background: 'var(--status-complete)',
            color: '#fff',
            borderRadius: 6,
          }}
        >
          <CheckCircle2 size={13} />
          Approved
        </div>
      )}

      {/* SKIPPED state display */}
      {isSkipped && (
        <div
          className="rounded-md text-[12px] font-semibold"
          style={{
            height: 32,
            paddingLeft: 12,
            paddingRight: 12,
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(148,163,184,0.12)',
            color: '#94A3B8',
            borderRadius: 6,
          }}
        >
          → Skipped
        </div>
      )}
    </div>
  );
};

export default ActionRow;
