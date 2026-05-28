import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { applyGrammarCorrections } from '@/utils/grammarCheck';
import type { DraftState, SectionKey, SkillAcquisitionGoal } from '@/types';
import { SECTION_ORDER } from '@/types';

interface GenerateButtonProps {
  sessionId: string;
}

// ─── Marcus-specific ABA draft prose ─────────────────────────────────────────
// For sessions without hand-crafted drafts we generate a generic placeholder.

const MARCUS_DRAFTS: Partial<Record<SectionKey, string>> = {
  demographics: `Client Name: Marcus D. | DOB: 06/15/2018 (Age 7) | Diagnosis: Autism Spectrum Disorder, Level 2 (F84.0)
Assigned BCBA: Dr. Chen, BCBA | Referring Provider: Dr. R. Morales, MD
Insurance: Aetna BCN | Member ID: AET-00183920 | Group: GRP-44821
Referral Date: 04/22/2026 | Service Setting: Home`,

  presenting_concerns: `Marcus D. is a 7-year-old male diagnosed with Autism Spectrum Disorder, Level 2 (DSM-5). His caregivers report that the primary referral concerns include persistent task refusal, significant difficulty with daily transitions (most notably the morning school routine), and mild caregiver-directed aggression during redirect attempts.

According to parental report, these behaviors have been present since approximately age 3 and have shown an escalating trajectory over the past several months. Transition-related meltdowns are described as occurring daily, lasting 10–30 minutes, and significantly disrupting the family's morning and evening routines. Task avoidance is pervasive across academic, self-care, and leisure contexts. Caregivers rate the overall functional impact on family life as severe.`,

  self_help: `Marcus demonstrates age-partial independence across self-help skill domains. He is fully toilet-trained and feeds himself using utensils with minimal supervision. Dressing skills are emerging: Marcus can don and doff loose-fitting garments independently but requires verbal prompting and occasional physical guidance for fasteners (buttons, zippers, snaps).

Hygiene routines (tooth-brushing, hand-washing, hair-combing) are completed only with step-by-step verbal or visual prompting; Marcus does not initiate these routines spontaneously. Bathing requires caregiver assistance for both sequencing and thoroughness. Overall, self-help skills are developing but remain below age expectations, suggesting clinically significant deficits in adaptive behavior that support the medical necessity for ABA intervention.`,

  daily_living: `Marcus follows single-step verbal directions independently in familiar contexts. Two-step directions require repetition or visual support to achieve compliance. Sustained attention on structured, non-preferred tasks is approximately 5–7 minutes before behavioral disruption (refusal, escape behaviors) is observed; preferred activities sustain engagement for up to 20 minutes.

Marcus navigates the home environment safely but does not demonstrate independent community safety skills (e.g., pedestrian safety, response to strangers). He does not manage time, money, or household chores at this time. These deficits in adaptive behavior across the daily living domain are consistent with his ASD Level 2 presentation and support the need for structured ABA programming.`,

  safety: `Caregiver report indicates a moderate elopement risk. Marcus has attempted to exit the front door without adult supervision on at least two confirmed occasions within the past month, both occurring during periods of heightened emotional dysregulation. No injuries have resulted, but the behavior presents significant safety concerns given proximity to a residential street.

Marcus also exhibits mild physical aggression (open-hand hitting) directed primarily toward his primary caregiver during redirection from preferred activities (most commonly tablet/iPad access). Aggression has not resulted in injury to date. Self-injurious behavior (SIB) is not currently reported. Caregiver maintains constant supervision. Safety programming — including elopement prevention protocols and FCT for protest/refusal — will be prioritized within the initial treatment plan.`,

  communication: `Marcus communicates using verbal speech, primarily at the 3–4 word phrase level (e.g., "want juice," "no school," "give me iPad"). Mean length of utterance (MLU) is estimated at approximately 3.5 morphemes based on caregiver report. Intelligibility to unfamiliar listeners is approximately 80%.

Spontaneous language is predominantly requesting and protesting; Marcus rarely initiates social conversation or comments. Functional communication training (FCT) is clinically indicated: Marcus currently relies on challenging behavior (crying, hitting) as his primary protest and refusal communication strategy rather than using verbal or augmentative means. No formal AAC system is currently in place. Communication targets will be integrated across all ABA programming to build a broader, functional communicative repertoire.`,

  skill_acquisitions: `Target skill acquisition domains identified for Marcus's initial treatment plan include: (1) following multi-step directions across contexts, (2) expanding functional verbal communication (FCT and requesting variety), (3) independent completion of self-help routines using visual activity schedules, and (4) tolerating transitions using a structured first-then visual system.

Programming will be delivered across home and community settings using a combination of discrete trial training (DTT) for foundational skills and naturalistic developmental behavioral intervention (NDBI) strategies to promote generalization. Progress monitoring will occur weekly via data collection on specified targets.`,

  behavior_targets: `Target Behavior 1 — Task Refusal: Defined as verbal or physical refusal to begin or continue a non-preferred task within 10 seconds of a directive, including dropping materials, vocalizing "no," crying, or leaving the designated work area. Operational definition to be finalized with caregiver in initial session. Baseline rate per caregiver report: approximately 8 occurrences per observed period.

Target Behavior 2 — Elopement: Defined as moving more than 10 feet from the caregiver-designated safe zone without permission, including running toward exits or doorways. Operational definition to be finalized. Baseline frequency per caregiver report: approximately 3 attempts per week.

Intervention strategies for both targets will include antecedent modifications, FCT, and differential reinforcement protocols.`,

  medical_necessity: `ABA services are medically necessary for Marcus D. based on the following clinical indicators: (1) confirmed diagnosis of Autism Spectrum Disorder, Level 2 (F84.0) by a licensed physician; (2) clinically significant deficits in adaptive behavior across communication, daily living, and social domains; (3) presence of challenging behaviors (task refusal, elopement, aggression) that impair participation in home, community, and pre-academic environments; and (4) failure to achieve developmentally appropriate milestones without structured behavioral intervention.

The frequency and intensity of services recommended (to be specified in the treatment plan) are commensurate with the severity of Marcus's presentation and caregiver training needs. Services will be delivered in the least restrictive environment consistent with safe and effective treatment.`,

  crisis_plan: `At this time, Marcus does not present with imminent risk of serious self-injury or harm to others. Crisis planning protocols are nonetheless established given the documented elopement risk and caregiver-directed aggression.

Crisis indicators: escalating aggression beyond current baseline, SIB emergence, or successful elopement resulting in exposure to traffic or other environmental hazards. Caregiver crisis response: (1) remain calm and avoid physical confrontation; (2) secure environment (close exterior doors and windows); (3) allow emotional de-escalation before re-engaging with demands; (4) contact assigned BCBA if behavior exceeds caregiver capacity. Emergency contacts and local crisis line information will be provided at intake. BCBA will conduct quarterly safety reviews and update this plan as needed.`,
};

// Generate a generic draft for a section without a hand-crafted one
function genericDraft(clientName: string, sectionTitle: string): string {
  return `[AI Draft — ${sectionTitle}]\n\nBased on information collected during the clinical interview for ${clientName}, this section will be populated with clinician-reviewed content. Please review, edit, and approve before generating the final assessment document.`;
}

// ─── Skill Acquisitions template fallback ────────────────────────────────────
// Used when the Anthropic API is unavailable (no key, 4xx, network error).
// Formats the goals captured in the store into structured clinical Markdown
// without requiring the API — so the section always shows real data.

function buildStructuredSkillsDraft(goals: SkillAcquisitionGoal[]): string {
  if (goals.length === 0) {
    return 'Skill acquisition targets to be determined. [BCBA to complete: add skill acquisition goals using the goal builder in the interview section.]';
  }

  const TEACHING_LABELS: Record<string, string> = {
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
    differential_reinforcement: 'Differential Reinforcement (DRA/DRI/DRO)',
    role_modeling: 'Role Modeling',
    social_stories: 'Social Stories',
    reinforcement_procedures: 'Reinforcement Procedures',
  };

  return goals
    .map((g, i) => {
      const strategies =
        [
          ...g.teachingStrategies.map((k) => TEACHING_LABELS[k] ?? k),
          ...(g.teachingStrategiesOther ? [g.teachingStrategiesOther] : []),
        ].join(', ') || '[BCBA to complete: select teaching strategies]';

      const targetSkill = g.targetSkill || '[BCBA to complete: enter target skill]';
      const opDef = g.operationalDefinition || '[BCBA to complete: enter operational definition]';
      const blPct = g.baselinePercent || '0';
      const blOpps = g.baselineOpportunities || 'multiple';
      const blPrompt = g.baselinePromptingDesc || 'maximum';
      const mcPct = g.masteryCriteriaPercent || '80';
      const mcSess = g.masteryCriteriaSessions || '3';
      const mcSet = g.masteryCriteriaSettings || '2';
      const mcPrompt = g.masteryCriteriaPrompting || 'independent';
      const genNotes =
        g.generalizationNotes ||
        'Skill will be practiced across multiple people, settings, materials, and environments to promote maintenance and generalization of acquired skills.';

      const stoTarget = Math.max(10, Math.round(Number(mcPct) / 8 / 5) * 5);
      const currentLevel =
        blPct === '0' || blPct === '' ? 'NEW' : `${blPct}% correct with ${blPrompt} prompting`;

      return `**Goal ${i + 1}: ${targetSkill}**

Operational Definition: ${opDef}

Teaching Strategies: ${strategies}

| Target Behavior | 6-Month Target (STO) | Baseline Data | Current Level | Mastery Criteria (LTO) |
|---|---|---|---|---|
| ${targetSkill} | Client will demonstrate ${targetSkill} in ${stoTarget}% of opportunities per week for 4 consecutive weeks. | ${blPct}% across ${blOpps} opportunities | ${currentLevel} | Client will demonstrate ${targetSkill} with ${mcPct}% accuracy across ${mcSess} consecutive sessions across ${mcSet} people/settings with ${mcPrompt} level of prompting. |

Generalization & Maintenance: ${genNotes}`;
    })
    .join('\n\n---\n\n');
}

// ─── Skill Acquisitions AI draft ─────────────────────────────────────────────

const generateSkillAcquisitionsDraft = async (sessionId: string): Promise<string> => {
  // Read directly from the store — NOT from the React closure snapshot.
  // By the time this function runs (after 8+ seconds of sequential section generation),
  // the session object captured in handleGenerate is stale. getState() always returns
  // the live store value at this exact moment.
  const liveSection = useSessionStore
    .getState()
    .sessions.find((s) => s.id === sessionId)
    ?.sections['skill_acquisitions'];

  const goals = liveSection?.skillGoals ?? [];

  console.log('generateSkillAcquisitionsDraft called, goals:', goals.length, goals.map(g => g.targetSkill));

  if (goals.length === 0) {
    return 'Skill acquisition targets to be determined. [BCBA to complete: add skill acquisition goals using the goal builder in the interview section.]';
  }

  const goalsData = goals.map((g) => ({
    targetSkill: g.targetSkill || '[Skill name not entered]',
    operationalDefinition: g.operationalDefinition || '[Definition not entered]',
    baselinePercent: g.baselinePercent || '0',
    baselineOpportunities: g.baselineOpportunities || 'multiple',
    baselinePromptingDesc: g.baselinePromptingDesc || 'maximum',
    promptingLevel: g.promptingLevel || 'full_physical',
    masteryCriteriaPercent: g.masteryCriteriaPercent || '80',
    masteryCriteriaSessions: g.masteryCriteriaSessions || '3',
    masteryCriteriaSettings: g.masteryCriteriaSettings || '2',
    masteryCriteriaPrompting: g.masteryCriteriaPrompting || 'independent',
    teachingStrategies: g.teachingStrategies ?? [],
    teachingStrategiesOther: g.teachingStrategiesOther || '',
    generalizationNotes:
      g.generalizationNotes ||
      'Skill will be practiced across multiple people, settings, materials, and environments to promote maintenance and generalization of acquired skills.',
  }));

  const TEACHING_STRATEGY_LABELS: Record<string, string> = {
    dtt: 'Discrete Trial Training (DTT)',
    net: 'Natural Environment Teaching (NET)',
    fct: 'Functional Communication Training (FCT)',
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
    differential_reinforcement: 'Differential Reinforcement (DRA/DRI/DRO)',
    role_modeling: 'Role Modeling',
    social_stories: 'Social Stories',
    reinforcement_procedures: 'Reinforcement Procedures',
  };

  const PROMPTING_LABELS: Record<string, string> = {
    independent: 'Independent',
    verbal: 'Verbal Prompt',
    gestural: 'Gestural Prompt',
    model: 'Model Prompt',
    partial_physical: 'Partial Physical Prompt',
    full_physical: 'Full Physical Prompt',
    combination: 'Combination of Prompts',
  };

  const formattedGoals = goalsData
    .map((g) => {
      const strategies =
        [
          ...g.teachingStrategies.map((k) => TEACHING_STRATEGY_LABELS[k] ?? k),
          ...(g.teachingStrategiesOther ? [g.teachingStrategiesOther] : []),
        ].join(', ') || '[BCBA to complete: select teaching strategies]';

      const currentLevel =
        g.baselinePercent === '0' || g.baselinePercent === ''
          ? 'NEW'
          : (PROMPTING_LABELS[g.promptingLevel] ?? g.promptingLevel);

      return `
GOAL:
Target Skill: ${g.targetSkill}
Operational Definition: ${g.operationalDefinition}
Teaching Strategies: ${strategies}
Baseline: ${g.baselinePercent}% correct across ${g.baselineOpportunities} opportunities with ${g.baselinePromptingDesc} level of prompting
Current Level: ${currentLevel}
Mastery Target: ${g.masteryCriteriaPercent}% accuracy across ${g.masteryCriteriaSessions} consecutive sessions across ${g.masteryCriteriaSettings} people/settings with ${g.masteryCriteriaPrompting} level of prompting
Generalization: ${g.generalizationNotes}
      `.trim();
    })
    .join('\n\n---\n\n');

  const apiKey = (import.meta.env as Record<string, string | undefined>).VITE_ANTHROPIC_API_KEY;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content:
            `You are a BCBA writing the Skills/Replacement Behaviors section of an ABA Initial Assessment document.\n\n` +
            `Format the following skill acquisition goals exactly as they would appear in a clinical ABA document.\n\n` +
            `For EACH goal, produce this structure:\n\n` +
            `**Target Skill: [targetSkill]**\n\n` +
            `Operational Definition: [operationalDefinition]\n\n` +
            `Teaching Strategies: [strategies as a natural comma-separated sentence]\n\n` +
            `| Target Behavior | 6-Month Target Level (Short-Term Objective) | Baseline Data | Current Level | Mastery Criteria (Long-Term Goal) |\n` +
            `|---|---|---|---|---|\n` +
            `| [targetSkill] | Client will demonstrate [targetSkill] in [masteryCriteriaPercent divided by 8, rounded to nearest 5]% of opportunities per week for 4 consecutive weeks. | [baselinePercent]% of opportunities | [currentLevel] | Client will demonstrate [targetSkill] with [masteryCriteriaPercent]% accuracy across [masteryCriteriaSessions] consecutive sessions across [masteryCriteriaSettings] people/settings with [masteryCriteriaPrompting] level of prompting. |\n\n` +
            `Generalization & Maintenance: [generalizationNotes]\n\n` +
            `---\n\n` +
            `Rules:\n` +
            `- Use "Client" as the placeholder name throughout — never use a real name\n` +
            `- If operationalDefinition looks like test/placeholder text (random letters, very short), write: [BCBA to complete: refine operational definition]\n` +
            `- If currentLevel is NEW, write NEW in the Current Level column\n` +
            `- Otherwise write the prompting level as the Current Level\n` +
            `- For the STO (6-Month Target), the percentage is always masteryCriteriaPercent ÷ 8, rounded to the nearest 5 (minimum 10%). Example: 80% mastery → STO at 10%\n` +
            `- Separate each goal with a horizontal rule line\n` +
            `- Write in formal clinical ABA documentation language\n` +
            `- Do not add any intro paragraph or explanation — output only the formatted goals\n\n` +
            `Here are the goals to format:\n\n` +
            formattedGoals,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as { content?: { text: string }[] };
  return data.content?.[0]?.text.trim() ?? 'Skill acquisition targets to be determined.';
};

// ─── Sequential animation constants ──────────────────────────────────────────

// Which sections get actual drafts (in order they animate)
const DRAFTABLE: SectionKey[] = SECTION_ORDER.filter((k) => k !== 'demographics');

const STEP_DELAY_MS = 420; // time between sections starting
const SECTION_DURATION_MS = 800; // simulated "writing" time per section

// ─── Component ────────────────────────────────────────────────────────────────

export const GenerateButton = ({ sessionId }: GenerateButtonProps) => {
  const navigate = useNavigate();
  const session = useSessionStore((s) => s.sessions.find((s) => s.id === sessionId) ?? null);
  const setDraftContent = useSessionStore((s) => s.setDraftContent);
  const setSessionStatus = useSessionStore((s) => s.setSessionStatus);

  const showToast = useSessionStore((s) => s.showToast);

  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState<'writing' | 'polishing' | 'done'>('writing');
  const [currentStep, setCurrentStep] = useState<number>(-1); // index into DRAFTABLE
  const [done, setDone] = useState(false);

  if (!session) return null;

  const clientName = session.clientName;
  const hasData = session.sectionsWithData > 0;

  const handleGenerate = async () => {
    if (isGenerating || done || !hasData) return;
    setIsGenerating(true);
    setPhase('writing');

    // ── Phase 1: write raw drafts sequentially ────────────────────────
    const rawDrafts: Partial<Record<SectionKey, string>> = {};

    for (let i = 0; i < DRAFTABLE.length; i++) {
      const key = DRAFTABLE[i];
      setCurrentStep(i);

      await new Promise<void>((res) => setTimeout(res, SECTION_DURATION_MS));

      const section = session.sections[key];

      // skill_acquisitions bypasses the completionState guard — generateSkillAcquisitionsDraft
      // reads live from the store and handles empty goals itself via buildStructuredSkillsDraft.
      if (key === 'skill_acquisitions') {
        try {
          const skillDraft = await generateSkillAcquisitionsDraft(sessionId);
          const skillDraftState: DraftState = skillDraft.includes('[BCBA to complete')
            ? 'partial'
            : 'drafted';
          setDraftContent(sessionId, 'skill_acquisitions', skillDraft, skillDraftState, skillDraft);
          rawDrafts[key] = skillDraft;
        } catch (err) {
          // API unavailable — format goals using the template fallback
          console.warn('Skill acquisitions AI draft failed, using template fallback:', err);
          const liveSect = useSessionStore
            .getState()
            .sessions.find((s) => s.id === sessionId)?.sections['skill_acquisitions'];
          const fallbackGoals = liveSect?.skillGoals ?? [];
          const content = buildStructuredSkillsDraft(fallbackGoals);
          const state: DraftState = content.includes('[BCBA to complete') ? 'partial' : 'drafted';
          setDraftContent(sessionId, 'skill_acquisitions', content, state, content);
          rawDrafts[key] = content;
        }
      } else if (section && section.completionState !== 'empty') {
        const content =
          MARCUS_DRAFTS[key] ?? genericDraft(clientName, section.title ?? key);
        // Store raw draft immediately so the UI feels responsive
        setDraftContent(sessionId, key, content, 'drafted', content);
        rawDrafts[key] = content;
      }

      if (i < DRAFTABLE.length - 1) {
        await new Promise<void>((res) => setTimeout(res, STEP_DELAY_MS));
      }
    }

    // ── Phase 2: grammar-check all drafted sections in parallel ───────
    setPhase('polishing');

    const sectionsToCheck = Object.entries(rawDrafts) as [SectionKey, string][];

    const results = await Promise.all(
      sectionsToCheck.map(([, text]) => applyGrammarCorrections(text)),
    );

    let totalCorrections = 0;

    sectionsToCheck.forEach(([key], idx) => {
      const { correctedText, correctionCount } = results[idx];
      totalCorrections += correctionCount;
      if (correctionCount > 0) {
        // Update the store with the grammar-corrected version
        setDraftContent(sessionId, key, correctedText, 'drafted', correctedText);
      }
    });

    // ── Finish ────────────────────────────────────────────────────────
    setSessionStatus(sessionId, 'ready_to_review');

    if (totalCorrections > 0) {
      showToast(
        `Grammar check complete — ${totalCorrections} correction${totalCorrections !== 1 ? 's' : ''} applied`,
      );
    }

    setPhase('done');
    setDone(true);
    setIsGenerating(false);

    await new Promise<void>((res) => setTimeout(res, 400));
    navigate(`/assessments/${sessionId}/review`);
  };

  const label = done
    ? 'Opening review…'
    : phase === 'polishing'
    ? 'Checking grammar…'
    : isGenerating
    ? `Writing section ${currentStep + 1} of ${DRAFTABLE.length}…`
    : 'Generate Assessment Draft';

  // Writing phase: 0–90 %. Polishing phase: 90–100 %.
  const pct = isGenerating
    ? phase === 'polishing'
      ? 95
      : Math.round(((currentStep + 1) / DRAFTABLE.length) * 90)
    : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar — visible while generating */}
      {isGenerating && (
        <div
          className="h-1 w-full overflow-hidden rounded-full"
          style={{ background: 'var(--border-subtle)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'var(--accent-teal)',
            }}
          />
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!hasData || isGenerating || done}
        className="w-full rounded-xl text-[14px] font-semibold transition-all duration-200"
        style={{
          height: 44,
          background: hasData && !isGenerating && !done
            ? 'var(--accent-teal)'
            : 'var(--surface-elevated)',
          color: hasData && !isGenerating && !done ? '#fff' : 'var(--text-tertiary)',
          border: 'none',
          cursor: hasData && !isGenerating && !done ? 'pointer' : 'default',
          letterSpacing: isGenerating ? 0 : undefined,
        }}
        onMouseEnter={(e) => {
          if (hasData && !isGenerating && !done)
            (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.filter = 'none';
        }}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {label}
          </span>
        ) : (
          label
        )}
      </button>

      {!hasData && (
        <p className="text-center text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          Collect data in at least one section before generating.
        </p>
      )}
    </div>
  );
};

export default GenerateButton;
