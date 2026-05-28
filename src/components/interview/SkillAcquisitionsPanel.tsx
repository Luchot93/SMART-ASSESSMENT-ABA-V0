import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { GuidedPrompts } from './GuidedPrompts';
import { SkillGoalCard } from './SkillGoalCard';

interface SkillAcquisitionsPanelProps {
  sessionId: string;
}

export const SkillAcquisitionsPanel = ({ sessionId }: SkillAcquisitionsPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredGoalId, setHoveredGoalId] = useState<string | null>(null);
  const [addBtnHover, setAddBtnHover] = useState(false);

  const skillGoals = useSessionStore(
    (s) =>
      s.sessions.find((sess) => sess.id === sessionId)
        ?.sections['skill_acquisitions']?.skillGoals ?? [],
  );
  const addSkillGoal   = useSessionStore((s) => s.addSkillGoal);
  const removeSkillGoal = useSessionStore((s) => s.removeSkillGoal);

  const handleAdd = () => {
    addSkillGoal(sessionId);
    const updated =
      useSessionStore
        .getState()
        .sessions.find((s) => s.id === sessionId)
        ?.sections.skill_acquisitions.skillGoals ?? [];
    const newId = updated[updated.length - 1]?.id;
    if (newId) setExpandedId(newId);
  };

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Spinner keyframe — injected once per mount */}
      <style>{`@keyframes _sa_spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* ── A) Guided Prompts ──────────────────────────────────────────────── */}
      <GuidedPrompts sessionId={sessionId} sectionKey="skill_acquisitions" />

      {/* ── B) Goal cards ─────────────────────────────────────────────────── */}
      {skillGoals.map((goal, index) => {
        const isExpanded = expandedId === goal.id;
        const isHovered  = hoveredGoalId === goal.id;

        const isComplete = goal.targetSkill !== '' && goal.operationalDefinition !== '';
        const isPartial  = goal.targetSkill !== '' && goal.operationalDefinition === '';

        const leftBorderColor = isComplete
          ? 'var(--accent-teal)'
          : isPartial
          ? '#F59E0B'
          : 'transparent';

        return (
          <div
            key={goal.id}
            onMouseEnter={() => setHoveredGoalId(goal.id)}
            onMouseLeave={() => setHoveredGoalId(null)}
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              background: isExpanded
                ? 'linear-gradient(135deg, var(--accent-teal-muted) 0%, var(--surface-card) 55%)'
                : 'var(--surface-card)',
              border: isExpanded
                ? '1px solid var(--accent-teal-border)'
                : '1px solid var(--border-subtle)',
              borderLeft: `3px solid ${leftBorderColor}`,
              boxShadow: isExpanded
                ? '0 0 0 1px var(--accent-teal-border), var(--shadow-card)'
                : 'none',
              transition: 'box-shadow 150ms',
            }}
          >
            {/* ── Header (always visible, click to toggle) ─────────────────── */}
            <div
              onClick={() => toggleExpand(goal.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {/* Number badge */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  minWidth: 24,
                  color: 'var(--accent-teal)',
                  flexShrink: 0,
                }}
              >
                #{index + 1}
              </span>

              {/* Skill name */}
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: goal.targetSkill ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontStyle: goal.targetSkill ? 'normal' : 'italic',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
              >
                {goal.targetSkill || 'New skill goal'}
              </span>

              {/* ✦ AI badge */}
              {goal.definitionIsAiGenerated && (
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--accent-teal)',
                    background: 'rgba(0,212,174,0.1)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                >
                  ✦ AI
                </span>
              )}

              {/* Loading spinner */}
              {goal.definitionIsLoading && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    border: '2px solid var(--border-default)',
                    borderTopColor: 'var(--accent-teal)',
                    borderRadius: '50%',
                    animation: '_sa_spin 0.7s linear infinite',
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Completion dot */}
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: isComplete
                    ? 'var(--accent-teal)'
                    : isPartial
                    ? '#F59E0B'
                    : 'transparent',
                  border: isComplete || isPartial
                    ? 'none'
                    : '1.5px solid var(--border-default)',
                }}
              />

              {/* Delete × — visible only on row hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (expandedId === goal.id) setExpandedId(null);
                  removeSkillGoal(sessionId, goal.id);
                }}
                title="Remove goal"
                aria-label="Remove skill goal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  fontSize: 14,
                  lineHeight: 1,
                  padding: '0 2px',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 150ms',
                }}
              >
                ×
              </button>

              {/* Chevron */}
              <ChevronDown
                size={14}
                style={{
                  flexShrink: 0,
                  color: 'var(--text-tertiary)',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms',
                }}
              />
            </div>

            {/* ── Expanded body ─────────────────────────────────────────────── */}
            {isExpanded && (
              <div
                style={{
                  borderTop: '1px solid var(--accent-teal-border)',
                  padding: '16px 20px 20px',
                }}
              >
                <SkillGoalCard
                  sessionId={sessionId}
                  goal={goal}
                  onCollapse={() => setExpandedId(null)}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* ── C) Add Skill Goal button ───────────────────────────────────────── */}
      <button
        onClick={handleAdd}
        onMouseEnter={() => setAddBtnHover(true)}
        onMouseLeave={() => setAddBtnHover(false)}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          background: addBtnHover ? 'rgba(0,212,174,0.14)' : 'rgba(0,212,174,0.08)',
          border: '1px dashed var(--accent-teal-border)',
          color: 'var(--accent-teal)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 150ms',
        }}
      >
        + Add Skill Goal
      </button>
    </div>
  );
};

export default SkillAcquisitionsPanel;
