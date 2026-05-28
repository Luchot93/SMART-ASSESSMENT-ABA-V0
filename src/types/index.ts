export type SessionStatus = 'in_progress' | 'ready_to_review' | 'generating' | 'complete';

export type SectionKey =
  | 'demographics'
  | 'presenting_concerns'
  | 'self_help'
  | 'daily_living'
  | 'safety'
  | 'communication'
  | 'self_stim'
  | 'medical_necessity'
  | 'skill_acquisitions'
  | 'behavior_targets'
  | 'crisis_plan';

export type CompletionState = 'empty' | 'partial' | 'complete';
export type DraftState = 'drafted' | 'partial' | 'blank' | 'in_dev';
export type ApprovalState = 'pending' | 'edited' | 'approved' | 'skipped';
export type RecordingState = 'idle' | 'recording' | 'saving' | 'transcript_ready';

export interface BehavioralIndicator {
  id: string;
  label: string;
  count: number;
  isCustom: boolean;
  unit: 'count' | 'duration' | 'tag';
}

export type TeachingStrategyKey =
  | 'dtt' | 'net' | 'fct' | 'behavioral_momentum' | 'errorless_teaching'
  | 'most_to_least' | 'least_to_most' | 'graduated_guidance' | 'modeling'
  | 'chaining' | 'prompt_fading' | 'visual_supports' | 'task_analysis'
  | 'incidental_teaching' | 'differential_reinforcement' | 'role_modeling'
  | 'social_stories' | 'reinforcement_procedures';

export type PromptingLevel =
  | 'independent' | 'verbal' | 'gestural' | 'model'
  | 'partial_physical' | 'full_physical' | 'combination';

export interface SkillAcquisitionGoal {
  id: string;
  targetSkill: string;
  operationalDefinition: string;
  definitionIsAiGenerated: boolean;
  definitionIsLoading: boolean;
  teachingStrategies: TeachingStrategyKey[];
  teachingStrategiesOther: string;
  promptingLevel: PromptingLevel | null;
  promptingLevelCombination: string;
  baselinePercent: string;
  baselineOpportunities: string;
  baselinePromptingDesc: string;
  masteryCriteriaPercent: string;
  masteryCriteriaSessions: string;
  masteryCriteriaSettings: string;
  masteryCriteriaPrompting: string;
  generalizationNotes: string;
}

export interface Section {
  key: SectionKey;
  title: string;
  completionState: CompletionState;
  notes: string;
  indicators: BehavioralIndicator[];
  recordingState: RecordingState;
  recordingDurationSeconds: number;
  transcript: string | null;
  transcriptFlagged: boolean;
  hasConflict: boolean;
  draftContent: string | null;
  aiOriginalContent: string | null;
  draftState: DraftState;
  approvalState: ApprovalState;
  lastSavedAt: string | null;
  skillGoals: SkillAcquisitionGoal[];
}

export interface ClientProfile {
  dob: string;               // ISO date string — "YYYY-MM-DD"
  phone: string;
  address: string;
  referralDate: string;      // ISO date string — "YYYY-MM-DD"
  insurerName: string;
  memberId: string;
  groupNumber: string;
  referringProvider: string;
  diagnosis: string;
  // ── Form v2 fields ──────────────────────────────────────────────────────────
  gender: string;
  icd10: string;
  medicaidId: string;
  assessmentType: 'Initial' | 'Reassessment';
  assessmentDate: string;    // ISO date string — "YYYY-MM-DD"
  parentGuardianNames: string;
  relationship: string;
  preferredLanguage: string;
  reasonForReferral: string;
  interventionSettings: string[];
}

export interface Session {
  id: string;
  clientName: string;
  clientId: string;
  bcbaName: string;
  bcbaId: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  consentGranted: boolean;
  consentGrantedAt: string | null;
  clientProfile: ClientProfile;
  sections: Record<SectionKey, Section>;
  sectionsWithData: number;
  totalInterviewSections: number;
  sectionsApproved: number;
}

export const SECTION_ORDER: SectionKey[] = [
  'demographics',
  'presenting_concerns',
  'self_help',
  'daily_living',
  'safety',
  'communication',
  'self_stim',
  'medical_necessity',
  'skill_acquisitions',
  'behavior_targets',
  'crisis_plan',
];

export const SECTION_TITLES: Record<SectionKey, string> = {
  demographics: 'Demographics & Referral Info',
  presenting_concerns: 'Presenting Concerns',
  self_help: 'Self-Help Skills',
  daily_living: 'Daily Living Skills',
  safety: 'Safety Concerns',
  communication: 'Communication',
  self_stim: 'Self-Stimulatory Behavior',
  medical_necessity: 'Medical Necessity',
  skill_acquisitions: 'Skill Acquisitions',
  behavior_targets: 'Behavior Targets',
  crisis_plan: 'Crisis Plan',
};

export const SECTIONS_WITH_INDICATORS: SectionKey[] = ['behavior_targets'];

export const SECTIONS_WITH_CUSTOM_INDICATORS: SectionKey[] = ['behavior_targets'];
