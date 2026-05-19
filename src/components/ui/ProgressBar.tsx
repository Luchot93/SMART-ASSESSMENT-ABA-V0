import type { CompletionState, SectionKey } from '@/types';
import { SECTION_ORDER } from '@/types';

// Interview sections only — excludes demographics (section 1)
const INTERVIEW_SECTIONS: SectionKey[] = SECTION_ORDER.filter((k) => k !== 'demographics');

interface ProgressBarProps {
  sections: Record<SectionKey, { completionState: CompletionState }>;
}

export const ProgressBar = ({ sections }: ProgressBarProps) => {
  const captured = INTERVIEW_SECTIONS.filter(
    (k) => sections[k]?.completionState !== 'empty',
  ).length;

  return (
    <div className="px-6 py-3">
      <div className="flex gap-[3px] mb-1.5">
        {INTERVIEW_SECTIONS.map((key) => {
          const filled = sections[key]?.completionState !== 'empty';
          return (
            <div
              key={key}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: filled ? 'var(--accent-teal)' : 'var(--border-default)',
                transition: 'background 400ms ease',
              }}
            />
          );
        })}
      </div>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {captured} of 10 sections captured
      </p>
    </div>
  );
};

export default ProgressBar;
