import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import type { PromptingLevel, SkillAcquisitionGoal, TeachingStrategyKey } from '@/types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface SkillGoalCardProps {
  sessionId: string;
  goal: SkillAcquisitionGoal;
  onCollapse: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SKILL_SUGGESTIONS = [
  'Responding to name',
  'Following one-step directions',
  'Following two-step directions',
  'Requesting wants/needs (manding)',
  'Requesting using full sentences',
  'Functional communication training',
  'Toilet training',
  'Hand washing',
  'Tooth brushing',
  'Dressing independently',
  'Social greetings',
  'Eye contact',
  'Joint attention',
  'Turn-taking',
  'Parallel play',
  'Cooperative play',
  'Identifying emotions',
  'Labeling objects',
  'Matching objects',
  'Categorization skills',
  'Safety skills',
  'Increasing vocalizations',
  'Imitation skills',
  'Following classroom routines',
  'Waiting skills',
  'Transitioning between activities',
  'Independent ADLs',
  'Reducing prompt dependency',
  'Generalization of learned skills',
];

const TEACHING_STRATEGY_LABELS: Record<TeachingStrategyKey, string> = {
  dtt: 'DTT',
  net: 'NET',
  fct: 'FCT',
  behavioral_momentum: 'Behavioral Momentum',
  errorless_teaching: 'Errorless Teaching',
  most_to_least: 'Most-to-Least Prompting',
  least_to_most: 'Least-to-Most Prompting',
  graduated_guidance: 'Graduated Guidance',
  modeling: 'Modeling',
  chaining: 'Chaining',
  prompt_fading: 'Prompt Fading',
  visual_supports: 'Visual Supports',
  task_analysis: 'Task Analysis',
  incidental_teaching: 'Incidental Teaching',
  differential_reinforcement: 'Differential Reinforcement',
  role_modeling: 'Role Modeling',
  social_stories: 'Social Stories',
  reinforcement_procedures: 'Reinforcement Procedures',
};

const TEACHING_STRATEGY_KEYS: TeachingStrategyKey[] = [
  'dtt', 'net', 'fct', 'behavioral_momentum', 'errorless_teaching',
  'most_to_least', 'least_to_most', 'graduated_guidance', 'modeling',
  'chaining', 'prompt_fading', 'visual_supports', 'task_analysis',
  'incidental_teaching', 'differential_reinforcement', 'role_modeling',
  'social_stories', 'reinforcement_procedures',
];

const PROMPTING_LEVEL_LABELS: Record<PromptingLevel, string> = {
  independent: 'Independent',
  verbal: 'Verbal',
  gestural: 'Gestural',
  model: 'Model',
  partial_physical: 'Partial Physical',
  full_physical: 'Full Physical',
  combination: 'Combination',
};

const PROMPTING_LEVELS: PromptingLevel[] = [
  'independent', 'verbal', 'gestural', 'model',
  'partial_physical', 'full_physical', 'combination',
];

const DEFAULT_GENERALIZATION =
  'Skill will be practiced across multiple people, settings, materials, and environments to promote maintenance and generalization of acquired skills.';

// ── Style helpers ─────────────────────────────────────────────────────────────

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-tertiary)',
  marginBottom: 8,
};

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    display: 'block',
    background: 'var(--surface-elevated)',
    border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-default)'}`,
    boxShadow: focused ? '0 0 0 3px var(--accent-teal-muted)' : 'none',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
    fontFamily: 'inherit',
  };
}

function pillStyle(selected: boolean): React.CSSProperties {
  return selected
    ? {
        background: 'rgba(0,212,174,0.15)',
        border: '1px solid var(--accent-teal)',
        color: 'var(--accent-teal)',
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 6,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }
    : {
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)',
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 6,
        cursor: 'pointer',
        fontFamily: 'inherit',
      };
}

function inlineInputStyle(width: number, focused: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    width,
    background: 'transparent',
    border: 'none',
    borderBottom: `1.5px solid ${focused ? 'var(--accent-teal)' : 'var(--border-default)'}`,
    borderRadius: 0,
    padding: '1px 4px',
    color: 'var(--text-primary)',
    fontSize: 13,
    textAlign: 'center',
    outline: 'none',
    fontFamily: 'inherit',
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export const SkillGoalCard = ({ sessionId, goal, onCollapse }: SkillGoalCardProps) => {
  const updateSkillGoal = useSessionStore((s) => s.updateSkillGoal);

  // ── Local field state ──────────────────────────────────────────────────────
  const [targetSkill, setTargetSkill]   = useState(goal.targetSkill);
  const [definition, setDefinition]     = useState(goal.operationalDefinition);
  const [stratOther, setStratOther]     = useState(goal.teachingStrategiesOther);
  const [combDesc, setCombDesc]         = useState(goal.promptingLevelCombination);
  const [blPercent, setBlPercent]       = useState(goal.baselinePercent);
  const [blOpps, setBlOpps]             = useState(goal.baselineOpportunities);
  const [blPrompt, setBlPrompt]         = useState(goal.baselinePromptingDesc);
  const [mcPercent, setMcPercent]       = useState(goal.masteryCriteriaPercent);
  const [mcSessions, setMcSessions]     = useState(goal.masteryCriteriaSessions);
  const [mcSettings, setMcSettings]     = useState(goal.masteryCriteriaSettings);
  const [mcPrompting, setMcPrompting]   = useState(goal.masteryCriteriaPrompting);
  const [genNotes, setGenNotes]         = useState(goal.generalizationNotes);

  // ── Focus state ────────────────────────────────────────────────────────────
  const [skillFocused, setSkillFocused] = useState(false);
  const [defFocused, setDefFocused]     = useState(false);
  const [otherFocused, setOtherFocused] = useState(false);
  const [combFocused, setCombFocused]   = useState(false);
  const [genFocused, setGenFocused]     = useState(false);
  const [inlineFocus, setInlineFocus]   = useState<string | null>(null);

  // ── Autocomplete ───────────────────────────────────────────────────────────
  const [showDropdown, setShowDropdown] = useState(false);

  const suggestions =
    targetSkill.trim() === ''
      ? SKILL_SUGGESTIONS.slice(0, 5)
      : SKILL_SUGGESTIONS.filter((s) =>
          s.toLowerCase().includes(targetSkill.toLowerCase()),
        ).slice(0, 5);

  // ── isMounted guard ────────────────────────────────────────────────────────
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // ── Stale-closure guard for definition ────────────────────────────────────
  const definitionRef = useRef(definition);
  useLayoutEffect(() => { definitionRef.current = definition; });

  // ── Field 7: initialize generalization notes on mount ─────────────────────
  useEffect(() => {
    if (goal.generalizationNotes === '') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGenNotes(DEFAULT_GENERALIZATION);
      updateSkillGoal(sessionId, goal.id, { generalizationNotes: DEFAULT_GENERALIZATION });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-generate operational definition ──────────────────────────────────
  useEffect(() => {
    if (targetSkill.trim().length < 4) return;

    const timer = setTimeout(async () => {
      if (!isMountedRef.current) return;
      if (definitionRef.current !== '') return;

      updateSkillGoal(sessionId, goal.id, { definitionIsLoading: true });

      try {
        const apiKey = (import.meta.env as Record<string, string | undefined>)
          .VITE_ANTHROPIC_API_KEY;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            ...(apiKey ? { 'x-api-key': apiKey } : {}),
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            messages: [
              {
                role: 'user',
                content:
                  `You are a BCBA writing an ABA initial assessment.\n` +
                  `Write a single operational definition for this skill acquisition target: "${targetSkill}"\n` +
                  `Rules: observable and measurable terms, response form, timing if relevant, use "Client", 1-2 sentences max, clinical ABA tone.\n` +
                  `Output ONLY the definition text. No preamble, no labels, no quotes.`,
              },
            ],
          }),
        });

        if (!isMountedRef.current) return;

        const data = (await res.json()) as { content?: { text: string }[] };
        const result = data.content?.[0]?.text ?? '';

        if (result) {
          setDefinition(result);
          updateSkillGoal(sessionId, goal.id, {
            operationalDefinition: result,
            definitionIsAiGenerated: true,
            definitionIsLoading: false,
          });
        } else {
          updateSkillGoal(sessionId, goal.id, { definitionIsLoading: false });
        }
      } catch {
        if (!isMountedRef.current) return;
        updateSkillGoal(sessionId, goal.id, { definitionIsLoading: false });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [targetSkill, sessionId, goal.id, updateSkillGoal]);

  // ── AutoSave hooks ─────────────────────────────────────────────────────────
  useAutoSave(targetSkill,  (v) => updateSkillGoal(sessionId, goal.id, { targetSkill: v }));
  useAutoSave(definition,   (v) => updateSkillGoal(sessionId, goal.id, { operationalDefinition: v }));
  useAutoSave(stratOther,   (v) => updateSkillGoal(sessionId, goal.id, { teachingStrategiesOther: v }));
  useAutoSave(combDesc,     (v) => updateSkillGoal(sessionId, goal.id, { promptingLevelCombination: v }));
  useAutoSave(blPercent,    (v) => updateSkillGoal(sessionId, goal.id, { baselinePercent: v }));
  useAutoSave(blOpps,       (v) => updateSkillGoal(sessionId, goal.id, { baselineOpportunities: v }));
  useAutoSave(blPrompt,     (v) => updateSkillGoal(sessionId, goal.id, { baselinePromptingDesc: v }));
  useAutoSave(mcPercent,    (v) => updateSkillGoal(sessionId, goal.id, { masteryCriteriaPercent: v }));
  useAutoSave(mcSessions,   (v) => updateSkillGoal(sessionId, goal.id, { masteryCriteriaSessions: v }));
  useAutoSave(mcSettings,   (v) => updateSkillGoal(sessionId, goal.id, { masteryCriteriaSettings: v }));
  useAutoSave(mcPrompting,  (v) => updateSkillGoal(sessionId, goal.id, { masteryCriteriaPrompting: v }));
  useAutoSave(genNotes,     (v) => updateSkillGoal(sessionId, goal.id, { generalizationNotes: v }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: 16,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 12,
      }}
    >

      {/* ── FIELD 1: Target Skill ─────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <label style={fieldLabel}>Target Skill</label>
        <input
          type="text"
          value={targetSkill}
          onChange={(e) => setTargetSkill(e.target.value)}
          onFocus={() => { setSkillFocused(true); setShowDropdown(true); }}
          onBlur={() => { setSkillFocused(false); setTimeout(() => setShowDropdown(false), 150); }}
          placeholder="e.g. Responding to name, requesting wants/needs..."
          style={inputStyle(skillFocused)}
        />
        {showDropdown && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-card)',
              marginTop: 4,
              overflow: 'hidden',
            }}
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => { setTargetSkill(s); setShowDropdown(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-elevated)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'none';
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── FIELD 2: Operational Definition ───────────────────────────────── */}
      <div>
        <label style={fieldLabel}>Operational Definition</label>
        {goal.definitionIsLoading ? (
          <div
            style={{
              ...inputStyle(false),
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 80,
              color: 'var(--text-tertiary)',
              fontSize: 13,
            }}
          >
            <span>✦</span>
            Generating definition…
          </div>
        ) : (
          <textarea
            value={definition}
            onChange={(e) => {
              setDefinition(e.target.value);
              if (goal.definitionIsAiGenerated) {
                updateSkillGoal(sessionId, goal.id, { definitionIsAiGenerated: false });
              }
            }}
            onFocus={() => setDefFocused(true)}
            onBlur={() => setDefFocused(false)}
            placeholder="Observable, measurable definition of the skill..."
            style={{ ...inputStyle(defFocused), minHeight: 80, resize: 'vertical' }}
          />
        )}
        {goal.definitionIsAiGenerated && !goal.definitionIsLoading && (
          <span
            style={{ fontSize: 11, color: 'var(--accent-teal)', marginTop: 4, display: 'block' }}
          >
            ✦ AI-generated — edit freely
          </span>
        )}
        {!goal.definitionIsAiGenerated && !goal.definitionIsLoading && !import.meta.env.VITE_ANTHROPIC_API_KEY && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 10 }}>⚙</span>
            Will auto-generate from skill name once Anthropic API is set up
          </span>
        )}
      </div>

      {/* ── FIELD 3: Teaching Strategies ──────────────────────────────────── */}
      <div>
        <label style={fieldLabel}>Teaching Strategies</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TEACHING_STRATEGY_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => {
                const updated = goal.teachingStrategies.includes(key)
                  ? goal.teachingStrategies.filter((s) => s !== key)
                  : [...goal.teachingStrategies, key];
                updateSkillGoal(sessionId, goal.id, { teachingStrategies: updated });
              }}
              style={pillStyle(goal.teachingStrategies.includes(key))}
            >
              {TEACHING_STRATEGY_LABELS[key]}
            </button>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>
            Other:
          </span>
          <input
            type="text"
            value={stratOther}
            onChange={(e) => setStratOther(e.target.value)}
            onFocus={() => setOtherFocused(true)}
            onBlur={() => setOtherFocused(false)}
            placeholder="Other strategy..."
            style={{ ...inputStyle(otherFocused), flex: 1 }}
          />
        </div>
      </div>

      {/* ── FIELD 4: Prompting Level ───────────────────────────────────────── */}
      <div>
        <label style={fieldLabel}>Current Prompting Level</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PROMPTING_LEVELS.map((key) => (
            <button
              key={key}
              onClick={() => {
                const next = goal.promptingLevel === key ? null : key;
                updateSkillGoal(sessionId, goal.id, { promptingLevel: next });
              }}
              style={pillStyle(goal.promptingLevel === key)}
            >
              {PROMPTING_LEVEL_LABELS[key]}
            </button>
          ))}
        </div>
        {goal.promptingLevel === 'combination' && (
          <div style={{ marginTop: 12 }}>
            <input
              type="text"
              value={combDesc}
              onChange={(e) => setCombDesc(e.target.value)}
              onFocus={() => setCombFocused(true)}
              onBlur={() => setCombFocused(false)}
              placeholder="Describe combination..."
              style={inputStyle(combFocused)}
            />
          </div>
        )}
      </div>

      {/* ── FIELD 5: Baseline Performance ─────────────────────────────────── */}
      <div>
        <label style={fieldLabel}>Baseline Performance</label>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2.2 }}>
          Client currently demonstrates approximately{' '}
          <input
            value={blPercent}
            onChange={(e) => setBlPercent(e.target.value)}
            onFocus={() => setInlineFocus('blPercent')}
            onBlur={() => setInlineFocus(null)}
            placeholder="%"
            style={inlineInputStyle(44, inlineFocus === 'blPercent')}
          />
          % correct responding across{' '}
          <input
            value={blOpps}
            onChange={(e) => setBlOpps(e.target.value)}
            onFocus={() => setInlineFocus('blOpps')}
            onBlur={() => setInlineFocus(null)}
            placeholder="#"
            style={inlineInputStyle(72, inlineFocus === 'blOpps')}
          />
          {' '}opportunities/trials with{' '}
          <input
            value={blPrompt}
            onChange={(e) => setBlPrompt(e.target.value)}
            onFocus={() => setInlineFocus('blPrompt')}
            onBlur={() => setInlineFocus(null)}
            placeholder="prompt level"
            style={inlineInputStyle(100, inlineFocus === 'blPrompt')}
          />
          {' '}level of prompting.
        </p>
      </div>

      {/* ── FIELD 6: Mastery Criteria ──────────────────────────────────────── */}
      <div>
        <label style={fieldLabel}>Mastery Criteria</label>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2.2 }}>
          Client will demonstrate{' '}
          <input
            value={mcPercent}
            onChange={(e) => setMcPercent(e.target.value)}
            onFocus={() => setInlineFocus('mcPercent')}
            onBlur={() => setInlineFocus(null)}
            placeholder="%"
            style={inlineInputStyle(44, inlineFocus === 'mcPercent')}
          />
          % accuracy across{' '}
          <input
            value={mcSessions}
            onChange={(e) => setMcSessions(e.target.value)}
            onFocus={() => setInlineFocus('mcSessions')}
            onBlur={() => setInlineFocus(null)}
            placeholder="#"
            style={inlineInputStyle(44, inlineFocus === 'mcSessions')}
          />
          {' '}consecutive sessions/days across{' '}
          <input
            value={mcSettings}
            onChange={(e) => setMcSettings(e.target.value)}
            onFocus={() => setInlineFocus('mcSettings')}
            onBlur={() => setInlineFocus(null)}
            placeholder="#"
            style={inlineInputStyle(44, inlineFocus === 'mcSettings')}
          />
          {' '}people/settings with{' '}
          <input
            value={mcPrompting}
            onChange={(e) => setMcPrompting(e.target.value)}
            onFocus={() => setInlineFocus('mcPrompting')}
            onBlur={() => setInlineFocus(null)}
            placeholder="prompt level"
            style={inlineInputStyle(100, inlineFocus === 'mcPrompting')}
          />
          {' '}level of prompting.
        </p>
      </div>

      {/* ── FIELD 7: Generalization & Maintenance ─────────────────────────── */}
      <div>
        <label style={fieldLabel}>Generalization &amp; Maintenance</label>
        <textarea
          value={genNotes}
          onChange={(e) => setGenNotes(e.target.value)}
          onFocus={() => setGenFocused(true)}
          onBlur={() => setGenFocused(false)}
          style={{ ...inputStyle(genFocused), minHeight: 80, resize: 'vertical' }}
        />
      </div>

      {/* ── Collapse button ────────────────────────────────────────────────── */}
      <button
        onClick={onCollapse}
        style={{
          fontSize: 12,
          color: 'var(--text-tertiary)',
          alignSelf: 'flex-end',
          marginTop: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          padding: 0,
        }}
      >
        ↑ Collapse
      </button>
    </div>
  );
};

export default SkillGoalCard;
