import { Lightbulb, Mic, PenLine } from 'lucide-react';
import type { CompletionState, SectionKey, Session } from '@/types';
import { SECTION_ORDER } from '@/types';
import { getSectionConfig } from '@/utils/sectionConfig';

interface SectionSidebarProps {
  session: Session;
  activeSectionKey: SectionKey | null;
  onSectionClick: (key: SectionKey) => void;
  hideHeader?: boolean;
}

function completionDotStyle(state: CompletionState): React.CSSProperties {
  if (state === 'complete') {
    return {
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      flexShrink: 0,
      background: 'var(--status-complete)',
      boxShadow: '0 0 6px rgba(52,211,153,0.3)',
    };
  }
  if (state === 'partial') {
    return {
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      flexShrink: 0,
      background: 'var(--status-partial)',
      boxShadow: '0 0 6px rgba(251,191,36,0.3)',
    };
  }
  return {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    background: 'transparent',
    border: '1.5px solid var(--border-default)',
  };
}

export const SectionSidebar = ({
  session,
  activeSectionKey,
  onSectionClick,
  hideHeader = false,
}: SectionSidebarProps) => {
  return (
    <div
      className="flex flex-col overflow-y-auto h-full"
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {!hideHeader && (
        <p
          className="px-4 pt-4 pb-2 text-[10px] font-medium uppercase"
          style={{ letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}
        >
          Sections
        </p>
      )}

      <ul>
        {SECTION_ORDER.map((key) => {
          const config = getSectionConfig(key);
          const section = session.sections[key];
          const isActive = activeSectionKey === key;
          const hasTranscript = section.transcript !== null;
          const hasNotes = section.notes.trim().length > 0;

          return (
            <li key={key}>
              <button
                onClick={() => onSectionClick(key)}
                className="relative flex w-full items-center gap-2 text-left transition-colors duration-150"
                style={{
                  height: 36,
                  paddingLeft: 12,
                  paddingRight: 16,
                  background: isActive ? 'var(--accent-teal-muted)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderLeft: isActive
                    ? '3px solid var(--accent-teal)'
                    : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      'var(--surface-card-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                {/* Completion dot or supposition icon */}
                {config.isSupposition ? (
                  <Lightbulb
                    size={12}
                    style={{ color: 'var(--accent-teal)', flexShrink: 0 }}
                  />
                ) : (
                  <span style={completionDotStyle(section.completionState)} />
                )}

                {/* Section number */}
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
                >
                  {config.sectionNumber}
                </span>

                {/* Section title */}
                <span className="flex-1 truncate text-[13px]">{config.title}</span>

                {/* Channel icons */}
                <span className="flex items-center gap-1 ml-1">
                  {hasTranscript && (
                    <Mic size={12} style={{ color: 'var(--status-complete)', flexShrink: 0 }} />
                  )}
                  {hasNotes && (
                    <PenLine size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SectionSidebar;
