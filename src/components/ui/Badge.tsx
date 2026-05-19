import { CheckCircle2 } from 'lucide-react';
import type { SessionStatus } from '@/types';

interface BadgeProps {
  status: SessionStatus;
}

export const Badge = ({ status }: BadgeProps) => {
  if (status === 'in_progress') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
        style={{ background: 'var(--status-partial-bg)', color: 'var(--status-partial)' }}
      >
        <span
          className="status-pulse h-2 w-2 flex-none rounded-full"
          style={{ background: 'var(--status-partial)' }}
        />
        In Progress
      </span>
    );
  }

  if (status === 'ready_to_review') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
        style={{ background: 'var(--accent-teal-muted)', color: 'var(--accent-teal)' }}
      >
        <span
          className="h-2 w-2 flex-none rounded-full"
          style={{ background: 'var(--accent-teal)' }}
        />
        Ready to Review
      </span>
    );
  }

  if (status === 'complete') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
        style={{ background: 'var(--status-complete-bg)', color: 'var(--status-complete)' }}
      >
        <CheckCircle2 size={12} className="flex-none" />
        Complete
      </span>
    );
  }

  return null;
};

export default Badge;
