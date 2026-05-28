import { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedGoal {
  title: string;
  opDef: string;
  teachingStrategies: string;
  tableMarkdown: string; // raw table lines — kept verbatim on save
  generalization: string;
}

// ─── Parse / reconstruct helpers ─────────────────────────────────────────────

function parseSkillsDraft(md: string): ParsedGoal[] {
  const blocks = md.split(/\n\n---\n\n/);
  return blocks.map((block) => {
    const title = /\*\*Goal \d+: (.+?)\*\*/.exec(block)?.[1] ?? '';

    const opDef =
      /Operational Definition: (.+?)(?=\n\nTeaching Strategies:)/s
        .exec(block)?.[1]
        ?.trim() ?? '';

    const teachingStrategies =
      /Teaching Strategies: (.+?)(?=\n\n\|)/s.exec(block)?.[1]?.trim() ?? '';

    const tableMarkdown = block
      .split('\n')
      .filter((l) => l.trim().startsWith('|'))
      .join('\n');

    const generalization =
      /Generalization & Maintenance: (.+)/s.exec(block)?.[1]?.trim() ?? '';

    return { title, opDef, teachingStrategies, tableMarkdown, generalization };
  });
}

function reconstructSkillsDraft(goals: ParsedGoal[]): string {
  return goals
    .map(
      (g, i) =>
        `**Goal ${i + 1}: ${g.title}**\n\nOperational Definition: ${g.opDef}\n\nTeaching Strategies: ${g.teachingStrategies}\n\n${g.tableMarkdown}\n\nGeneralization & Maintenance: ${g.generalization}`,
    )
    .join('\n\n---\n\n');
}

// ─── Sub-component: single goal card ─────────────────────────────────────────

interface GoalCardProps {
  goal: ParsedGoal;
  index: number;
  sessionId: string;
  onChange: (updated: ParsedGoal) => void;
}

const GoalCard = ({ goal, index, sessionId, onChange }: GoalCardProps) => {
  const set = (field: keyof ParsedGoal) => (value: string) =>
    onChange({ ...goal, [field]: value });

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.07)',
        borderLeft: '3px solid var(--accent-teal)',
        borderRadius: 8,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Goal number header */}
      <div
        className="text-[11px] font-semibold uppercase"
        style={{ letterSpacing: '0.08em', color: 'var(--accent-teal)' }}
      >
        Goal {index + 1}
      </div>

      {/* Target Skill */}
      <div className="flex flex-col gap-1">
        <label
          className="text-[11px] font-semibold"
          style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}
        >
          TARGET SKILL
        </label>
        <input
          className="demo-input"
          value={goal.title}
          onChange={(e) => set('title')(e.target.value)}
          placeholder="Enter target skill name"
        />
      </div>

      {/* Operational Definition */}
      <div className="flex flex-col gap-1">
        <label
          className="text-[11px] font-semibold"
          style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}
        >
          OPERATIONAL DEFINITION
        </label>
        <textarea
          className="demo-input"
          value={goal.opDef}
          onChange={(e) => set('opDef')(e.target.value)}
          placeholder="Describe the observable, measurable definition of this skill"
          style={{ minHeight: 80, resize: 'vertical' }}
        />
      </div>

      {/* Teaching Strategies */}
      <div className="flex flex-col gap-1">
        <label
          className="text-[11px] font-semibold"
          style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}
        >
          TEACHING STRATEGIES
        </label>
        <input
          className="demo-input"
          value={goal.teachingStrategies}
          onChange={(e) => set('teachingStrategies')(e.target.value)}
          placeholder="e.g. DTT, Behavioral Momentum, Least-to-Most Prompting"
        />
      </div>

      {/* Table data — read-only callout */}
      <div
        className="flex items-start gap-2.5 rounded-lg px-3.5 py-2.5"
        style={{
          background: 'rgba(96,165,250,0.06)',
          border: '1px solid rgba(96,165,250,0.2)',
        }}
      >
        <span style={{ fontSize: 13, marginTop: 1 }}>📊</span>
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-medium" style={{ color: '#1E40AF' }}>
            Baseline, targets & mastery criteria
          </span>
          <span className="text-[12px]" style={{ color: '#3B5998' }}>
            These values come from the interview goal builder and are reflected in the
            data table.{' '}
            <Link
              to={`/assessments/${sessionId}/interview`}
              className="underline underline-offset-2 font-medium"
              style={{ color: 'var(--accent-teal)' }}
            >
              Update in Interview →
            </Link>
          </span>
        </div>
      </div>

      {/* Generalization & Maintenance */}
      <div className="flex flex-col gap-1">
        <label
          className="text-[11px] font-semibold"
          style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}
        >
          GENERALIZATION &amp; MAINTENANCE
        </label>
        <textarea
          className="demo-input"
          value={goal.generalization}
          onChange={(e) => set('generalization')(e.target.value)}
          placeholder="Describe generalization plan across people, settings, and materials"
          style={{ minHeight: 60, resize: 'vertical' }}
        />
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface SkillAcquisitionsEditorProps {
  content: string;
  sessionId: string;
  onChange: (text: string) => void;
  onClose: () => void;
  saveState: 'idle' | 'saving' | 'saved';
}

export const SkillAcquisitionsEditor = ({
  content,
  sessionId,
  onChange,
  onClose,
  saveState,
}: SkillAcquisitionsEditorProps) => {
  const [goals, setGoals] = useState<ParsedGoal[]>(() => parseSkillsDraft(content));

  const handleGoalChange = (index: number, updated: ParsedGoal) => {
    const next = goals.map((g, i) => (i === index ? updated : g));
    setGoals(next);
    onChange(reconstructSkillsDraft(next));
  };

  const handleSave = () => {
    onChange(reconstructSkillsDraft(goals));
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      <div
        className="flex items-center gap-1.5 text-[11px] font-medium"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span>✏</span>
        <span>Edit skill acquisition goals — click Save &amp; Close when done</span>
      </div>

      {/* Goal cards */}
      {goals.map((goal, i) => (
        <GoalCard
          key={i}
          goal={goal}
          index={i}
          sessionId={sessionId}
          onChange={(updated) => handleGoalChange(i, updated)}
        />
      ))}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleSave}
          className="rounded-lg px-4 py-1.5 text-[13px] font-semibold transition-all duration-150"
          style={{
            background: 'var(--accent-teal)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.filter = 'none';
          }}
        >
          Save &amp; Close
        </button>

        {saveState !== 'idle' && (
          <span
            className="text-[11px] transition-opacity duration-300"
            style={{
              color:
                saveState === 'saved' ? 'var(--status-complete)' : 'var(--text-tertiary)',
            }}
          >
            {saveState === 'saving' ? 'saving…' : '✓ Saved'}
          </span>
        )}
      </div>
    </div>
  );
};

export default SkillAcquisitionsEditor;
