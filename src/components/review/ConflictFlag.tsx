import { useState } from 'react';
import type { Section } from '@/types';

interface ConflictFlagProps {
  section: Section;
}

export const ConflictFlag = ({ section }: ConflictFlagProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (!section.hasConflict || dismissed) return null;

  // Extract first meaningful lines from transcript and notes for comparison
  const transcriptPreview = section.transcript
    ? section.transcript.split('\n')[0]?.replace(/^CAREGIVER:\s*/i, '').trim().slice(0, 120)
    : '—';
  const notePreview = section.notes.trim().slice(0, 120) || '—';

  return (
    <div
      className="mb-4 flex flex-col gap-3 rounded-md px-4 py-3"
      style={{
        background: 'rgba(69,26,3,0.06)',
        border: '1px solid rgba(146,64,14,0.4)',
        borderRadius: 6,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[12px] font-semibold"
          style={{ color: '#92400E' }}
        >
          ⚠ BCBA note overrides transcript — verify before approving
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="flex-none rounded px-2.5 py-1 text-[11px] font-medium transition-colors duration-150"
          style={{
            background: 'rgba(146,64,14,0.1)',
            color: '#92400E',
            border: '1px solid rgba(146,64,14,0.3)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(146,64,14,0.18)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(146,64,14,0.1)';
          }}
        >
          Understood
        </button>
      </div>

      {/* Comparison rows */}
      <div className="flex flex-col gap-2">
        <CompareRow label="TRANSCRIPT" value={transcriptPreview} />
        <CompareRow label="YOUR NOTE" value={notePreview} />
      </div>
    </div>
  );
};

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="mt-px flex-none rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
        style={{
          background: 'rgba(146,64,14,0.12)',
          color: '#92400E',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
      <p
        className="text-[12px] italic leading-relaxed"
        style={{ color: '#78350F' }}
      >
        {value}
        {value.length >= 120 ? '…' : ''}
      </p>
    </div>
  );
}

export default ConflictFlag;
