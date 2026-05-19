import { Mic, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Session } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface SessionCardProps {
  session: Session;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_LEFT_BORDER: Record<Session['status'], string> = {
  in_progress: 'var(--status-partial)',
  ready_to_review: 'var(--accent-teal)',
  complete: 'var(--status-complete)',
  generating: 'var(--status-edited)',
};

function getCardHref(session: Session): string {
  if (session.status === 'in_progress') return `/assessments/${session.id}/interview`;
  return `/assessments/${session.id}/review`;
}

export const SessionCard = ({ session }: SessionCardProps) => {
  const progress =
    session.totalInterviewSections > 0
      ? (session.sectionsWithData / session.totalInterviewSections) * 100
      : 0;

  const sectionVals = Object.values(session.sections);
  const hasTranscript = sectionVals.some((s) => s.transcript !== null);
  const hasNotes = sectionVals.some((s) => s.notes.trim().length > 0);

  const leftBorderColor = STATUS_LEFT_BORDER[session.status];

  return (
    <Link
      to={getCardHref(session)}
      className="block rounded-xl transition-all duration-150"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderLeft: `3px solid ${leftBorderColor}`,
        boxShadow: 'var(--shadow-card)',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'var(--surface-card-hover)';
        el.style.boxShadow = 'var(--shadow-elevated)';
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'var(--surface-card)';
        el.style.boxShadow = 'var(--shadow-card)';
        el.style.transform = 'translateY(0)';
      }}
    >
      <div className="p-4">
        {/* Row 1: Name + Badge */}
        <div className="flex items-center justify-between gap-3">
          <span
            className="text-base font-semibold leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {session.clientName}
          </span>
          <Badge status={session.status} />
        </div>

        {/* Row 2: Timestamp */}
        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          Updated {formatRelativeTime(session.updatedAt)}
        </p>

        {/* Row 3: Progress bar */}
        <div
          className="mt-3 h-1 w-full overflow-hidden rounded-full"
          style={{ background: 'var(--border-default)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: 'var(--accent-teal)' }}
          />
        </div>

        {/* Row 4: Section count + channel icons + CTA */}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {session.sectionsWithData}/{session.totalInterviewSections} sections
            </span>
            <div className="flex items-center gap-1.5">
              {hasTranscript && (
                <Mic size={13} style={{ color: 'var(--status-complete)' }} />
              )}
              {hasNotes && (
                <PenLine size={13} style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>
          </div>
          <CtaButton status={session.status} />
        </div>
      </div>
    </Link>
  );
};

const CtaButton = ({ status }: { status: Session['status'] }) => {
  if (status === 'in_progress') {
    return (
      <span
        className="inline-flex items-center rounded-lg px-3 text-[13px] font-medium"
        style={{ height: '36px', background: 'var(--accent-teal)', color: '#fff' }}
      >
        Continue →
      </span>
    );
  }
  if (status === 'ready_to_review') {
    return (
      <span
        className="inline-flex items-center rounded-lg px-3 text-[13px] font-medium"
        style={{
          height: '36px',
          background: 'transparent',
          color: 'var(--accent-teal)',
          border: '1px solid var(--accent-teal)',
        }}
      >
        Review →
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-lg px-3 text-[13px] font-medium"
      style={{ height: '36px', background: 'transparent', color: 'var(--text-secondary)' }}
    >
      View
    </span>
  );
};

export default SessionCard;
