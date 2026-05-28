import { create } from 'zustand';
import type {
  ApprovalState,
  ClientProfile,
  DraftState,
  RecordingState,
  Section,
  SectionKey,
  Session,
  SessionStatus,
  SkillAcquisitionGoal,
} from '@/types';
import { mockSessions } from './mockData';

// ─── State / Actions interfaces ──────────────────────────────────────────────

interface StoreState {
  sessions: Session[];
  activeSessionId: string | null;
  activeSectionKey: SectionKey | null;
  filterStatus: SessionStatus | 'all';
  searchQuery: string;
  pendingToast: string | null;
}

interface StoreActions {
  // UI navigation
  setFilterStatus: (status: SessionStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  setActiveSession: (sessionId: string) => void;
  setActiveSection: (sectionKey: SectionKey) => void;
  showToast: (msg: string) => void;
  dismissToast: () => void;

  // Section data — each maps to a single Supabase UPDATE
  updateSectionNotes: (sessionId: string, sectionKey: SectionKey, notes: string) => void;
  updateIndicatorCount: (
    sessionId: string,
    sectionKey: SectionKey,
    indicatorId: string,
    delta: number,
  ) => void;
  addCustomIndicator: (sessionId: string, sectionKey: SectionKey, label: string) => void;
  removeCustomIndicator: (sessionId: string, sectionKey: SectionKey, indicatorId: string) => void;
  resetIndicator: (sessionId: string, sectionKey: SectionKey, indicatorId: string) => void;
  setRecordingState: (
    sessionId: string,
    sectionKey: SectionKey,
    state: RecordingState,
  ) => void;
  setRecordingDuration: (sessionId: string, sectionKey: SectionKey, seconds: number) => void;
  setTranscript: (sessionId: string, sectionKey: SectionKey, transcript: string) => void;
  flagTranscript: (sessionId: string, sectionKey: SectionKey, flagged: boolean) => void;

  // Session-level
  grantConsent: (sessionId: string) => void;
  setSessionStatus: (sessionId: string, status: SessionStatus) => void;
  markSessionComplete: (sessionId: string) => void;

  // Draft / review workflow
  setDraftContent: (
    sessionId: string,
    sectionKey: SectionKey,
    content: string | null,
    draftState: DraftState,
    aiOriginal?: string,
  ) => void;
  setApprovalState: (
    sessionId: string,
    sectionKey: SectionKey,
    state: ApprovalState,
  ) => void;
  markSectionEdited: (sessionId: string, sectionKey: SectionKey) => void;
  revertToAiOriginal: (sessionId: string, sectionKey: SectionKey) => void;

  // Skill acquisition goals
  addSkillGoal: (sessionId: string) => void;
  updateSkillGoal: (sessionId: string, goalId: string, patch: Partial<SkillAcquisitionGoal>) => void;
  removeSkillGoal: (sessionId: string, goalId: string) => void;
  reorderSkillGoals: (sessionId: string, fromIndex: number, toIndex: number) => void;

  // Demographics form
  updateClientProfile: (sessionId: string, patch: Partial<ClientProfile>) => void;
  updateClientName: (sessionId: string, name: string) => void;

  // Derived field recomputation
  computeDerivedFields: (sessionId: string) => void;

  // Computed selectors
  getFilteredSessions: () => Session[];
  getActiveSession: () => Session | null;
  getActiveSection: () => Section | null;
  getSessionProgress: (
    id: string,
  ) => { withData: number; total: number; approved: number };
  canExport: (sessionId: string) => boolean;
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

const patchSection = (
  sessions: Session[],
  sessionId: string,
  key: SectionKey,
  patch: (s: Section) => Partial<Section>,
): Session[] =>
  sessions.map((s) => {
    if (s.id !== sessionId) return s;
    const section = s.sections[key];
    return {
      ...s,
      sections: { ...s.sections, [key]: { ...section, ...patch(section) } },
    };
  });

const recount = (sessions: Session[], sessionId: string): Session[] =>
  sessions.map((s) => {
    if (s.id !== sessionId) return s;
    const vals = Object.values(s.sections);
    const interview = vals.filter((sec) => sec.key !== 'demographics');
    return {
      ...s,
      sectionsWithData: interview.filter((sec) => sec.completionState !== 'empty').length,
      sectionsApproved: vals.filter(
        (sec) => sec.approvalState === 'approved' || sec.approvalState === 'skipped',
      ).length,
    };
  });

// Patch a section then recount session-level derived fields in one pass.
const patchAndRecount = (
  sessions: Session[],
  sessionId: string,
  key: SectionKey,
  patch: (s: Section) => Partial<Section>,
): Session[] => recount(patchSection(sessions, sessionId, key, patch), sessionId);

// Derive completion state from current section content.
const deriveCompletion = (
  notes: string,
  transcript: string | null,
  indicatorCount: number,
): Section['completionState'] => {
  const hasData = notes.trim().length > 0 || transcript !== null || indicatorCount > 0;
  if (!hasData) return 'empty';
  if (notes.trim().length > 0 && transcript !== null) return 'complete';
  return 'partial';
};

// Derive demographics completion from required fields.
const deriveDemographicsCompletion = (
  clientName: string,
  p: ClientProfile,
): Section['completionState'] => {
  const required = [clientName.trim(), p.dob, p.diagnosis.trim(), p.medicaidId.trim(), p.assessmentDate];
  const filled = required.filter((v) => v.length > 0).length;
  if (filled === 0) return 'empty';
  if (filled === required.length) return 'complete';
  return 'partial';
};

// Derive skill_acquisitions completion from structured goals array.
const deriveSkillAcquisitionsCompletion = (
  skillGoals: SkillAcquisitionGoal[],
): Section['completionState'] => {
  if (skillGoals.length === 0) return 'empty';
  if (skillGoals.every((g) => g.targetSkill !== '' && g.operationalDefinition !== '')) return 'complete';
  return 'partial';
};

const now = () => new Date().toISOString();

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSessionStore = create<StoreState & StoreActions>()((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  sessions: mockSessions,
  activeSessionId: null,
  activeSectionKey: null,
  filterStatus: 'all',
  searchQuery: '',
  pendingToast: null,

  // ── UI navigation ──────────────────────────────────────────────────────────
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
  setActiveSection: (sectionKey) => set({ activeSectionKey: sectionKey }),
  showToast: (msg) => set({ pendingToast: msg }),
  dismissToast: () => set({ pendingToast: null }),

  // ── Section data ───────────────────────────────────────────────────────────

  updateSectionNotes: (sessionId, sectionKey, notes) =>
    set(({ sessions }) => ({
      sessions: patchAndRecount(sessions, sessionId, sectionKey, (s) => ({
        notes,
        completionState: deriveCompletion(notes, s.transcript, s.indicators.length),
        lastSavedAt: now(),
      })),
    })),

  updateIndicatorCount: (sessionId, sectionKey, indicatorId, delta) =>
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, sectionKey, (s) => ({
        indicators: s.indicators.map((i) =>
          i.id === indicatorId ? { ...i, count: Math.max(0, i.count + delta) } : i,
        ),
      })),
    })),

  removeCustomIndicator: (sessionId, sectionKey, indicatorId) =>
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, sectionKey, (s) => ({
        indicators: s.indicators.filter((i) => i.id !== indicatorId),
      })),
    })),

  addCustomIndicator: (sessionId, sectionKey, label) =>
    set(({ sessions }) => ({
      sessions: patchAndRecount(sessions, sessionId, sectionKey, (s) => ({
        indicators: [
          ...s.indicators,
          {
            id: crypto.randomUUID(),
            label,
            count: 0,
            isCustom: true,
            unit: 'count' as const,
          },
        ],
        completionState:
          s.completionState === 'empty' ? 'partial' : s.completionState,
      })),
    })),

  resetIndicator: (sessionId, sectionKey, indicatorId) =>
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, sectionKey, (s) => ({
        indicators: s.indicators.map((i) =>
          i.id === indicatorId ? { ...i, count: 0 } : i,
        ),
      })),
    })),

  setRecordingState: (sessionId, sectionKey, state) =>
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, sectionKey, () => ({
        recordingState: state,
      })),
    })),

  setRecordingDuration: (sessionId, sectionKey, seconds) =>
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, sectionKey, () => ({
        recordingDurationSeconds: seconds,
      })),
    })),

  setTranscript: (sessionId, sectionKey, transcript) =>
    set(({ sessions }) => ({
      sessions: patchAndRecount(sessions, sessionId, sectionKey, (s) => ({
        transcript,
        recordingState: 'transcript_ready' as const,
        completionState: deriveCompletion(s.notes, transcript, s.indicators.length),
        lastSavedAt: now(),
      })),
    })),

  flagTranscript: (sessionId, sectionKey, flagged) =>
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, sectionKey, () => ({
        transcriptFlagged: flagged,
      })),
    })),

  // ── Session-level ──────────────────────────────────────────────────────────

  grantConsent: (sessionId) =>
    set(({ sessions }) => ({
      sessions: sessions.map((s) =>
        s.id !== sessionId
          ? s
          : { ...s, consentGranted: true, consentGrantedAt: now() },
      ),
    })),

  setSessionStatus: (sessionId, status) =>
    set(({ sessions }) => ({
      sessions: sessions.map((s) =>
        s.id !== sessionId ? s : { ...s, status, updatedAt: now() },
      ),
    })),

  markSessionComplete: (sessionId) =>
    set(({ sessions }) => ({
      sessions: sessions.map((s) =>
        s.id !== sessionId ? s : { ...s, status: 'complete', updatedAt: now() },
      ),
    })),

  // ── Draft / review workflow ────────────────────────────────────────────────

  setDraftContent: (sessionId, sectionKey, content, draftState, aiOriginal) =>
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, sectionKey, (s) => ({
        draftContent: content,
        draftState,
        aiOriginalContent:
          aiOriginal !== undefined ? aiOriginal : s.aiOriginalContent,
        lastSavedAt: now(),
      })),
    })),

  setApprovalState: (sessionId, sectionKey, state) =>
    set(({ sessions }) => ({
      sessions: patchAndRecount(sessions, sessionId, sectionKey, () => ({
        approvalState: state,
      })),
    })),

  markSectionEdited: (sessionId, sectionKey) =>
    set((state) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      const wasApproved = session?.sections[sectionKey]?.approvalState === 'approved';
      return {
        pendingToast: wasApproved
          ? 'Section un-approved — re-approve when ready'
          : state.pendingToast,
        sessions: patchAndRecount(state.sessions, sessionId, sectionKey, () => ({
          approvalState: 'edited' as ApprovalState,
        })),
      };
    }),

  revertToAiOriginal: (sessionId, sectionKey) =>
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, sectionKey, (s) => ({
        draftContent: s.aiOriginalContent,
        draftState: 'drafted' as DraftState,
        approvalState: 'pending' as ApprovalState,
      })),
    })),

  // ── Skill acquisition goals ───────────────────────────────────────────────

  addSkillGoal: (sessionId) => {
    const newGoal: SkillAcquisitionGoal = {
      id: crypto.randomUUID(),
      targetSkill: '',
      operationalDefinition: '',
      definitionIsAiGenerated: false,
      definitionIsLoading: false,
      teachingStrategies: [],
      teachingStrategiesOther: '',
      promptingLevel: null,
      promptingLevelCombination: '',
      baselinePercent: '',
      baselineOpportunities: '',
      baselinePromptingDesc: '',
      masteryCriteriaPercent: '',
      masteryCriteriaSessions: '',
      masteryCriteriaSettings: '',
      masteryCriteriaPrompting: '',
      generalizationNotes: '',
    };
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, 'skill_acquisitions', (s) => ({
        skillGoals: [...s.skillGoals, newGoal],
      })),
    }));
    get().computeDerivedFields(sessionId);
  },

  updateSkillGoal: (sessionId, goalId, patch) => {
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, 'skill_acquisitions', (s) => ({
        skillGoals: s.skillGoals.map((g) =>
          g.id === goalId ? { ...g, ...patch } : g,
        ),
      })),
    }));
    get().computeDerivedFields(sessionId);
  },

  removeSkillGoal: (sessionId, goalId) => {
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, 'skill_acquisitions', (s) => ({
        skillGoals: s.skillGoals.filter((g) => g.id !== goalId),
      })),
    }));
    get().computeDerivedFields(sessionId);
  },

  reorderSkillGoals: (sessionId, fromIndex, toIndex) =>
    set(({ sessions }) => ({
      sessions: patchSection(sessions, sessionId, 'skill_acquisitions', (s) => {
        const goals = [...s.skillGoals];
        const [removed] = goals.splice(fromIndex, 1);
        goals.splice(toIndex, 0, removed);
        return { skillGoals: goals };
      }),
    })),

  // ── Demographics form ──────────────────────────────────────────────────────

  updateClientProfile: (sessionId, patch) =>
    set(({ sessions }) => ({
      sessions: sessions.map((s) => {
        if (s.id !== sessionId) return s;
        const newProfile = { ...s.clientProfile, ...patch };
        const completionState = deriveDemographicsCompletion(s.clientName, newProfile);
        return {
          ...s,
          clientProfile: newProfile,
          sections: {
            ...s.sections,
            demographics: { ...s.sections.demographics, completionState },
          },
        };
      }),
    })),

  updateClientName: (sessionId, clientName) =>
    set(({ sessions }) => ({
      sessions: sessions.map((s) => {
        if (s.id !== sessionId) return s;
        const completionState = deriveDemographicsCompletion(clientName, s.clientProfile);
        return {
          ...s,
          clientName,
          sections: {
            ...s.sections,
            demographics: { ...s.sections.demographics, completionState },
          },
        };
      }),
    })),

  // ── Derived field recomputation ────────────────────────────────────────────

  computeDerivedFields: (sessionId) =>
    set(({ sessions }) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return { sessions };
      const skillGoals = session.sections.skill_acquisitions.skillGoals;
      const patched = patchSection(sessions, sessionId, 'skill_acquisitions', () => ({
        completionState: deriveSkillAcquisitionsCompletion(skillGoals),
      }));
      return { sessions: recount(patched, sessionId) };
    }),

  // ── Computed selectors ─────────────────────────────────────────────────────

  getFilteredSessions: () => {
    const { sessions, filterStatus, searchQuery } = get();
    const q = searchQuery.trim().toLowerCase();
    return sessions
      .filter((s) => filterStatus === 'all' || s.status === filterStatus)
      .filter(
        (s) =>
          !q ||
          s.clientName.toLowerCase().includes(q) ||
          s.bcbaName.toLowerCase().includes(q),
      );
  },

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId) ?? null;
  },

  getActiveSection: () => {
    const state = get();
    const session = state.getActiveSession();
    if (!session || !state.activeSectionKey) return null;
    return session.sections[state.activeSectionKey] ?? null;
  },

  getSessionProgress: (id) => {
    const session = get().sessions.find((s) => s.id === id);
    if (!session) return { withData: 0, total: 0, approved: 0 };
    return {
      withData: session.sectionsWithData,
      total: session.totalInterviewSections,
      approved: session.sectionsApproved,
    };
  },

  canExport: (sessionId) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return false;
    return Object.values(session.sections)
      .filter((s) => s.key !== 'demographics')
      .every(
        (s) => s.approvalState === 'approved' || s.approvalState === 'skipped',
      );
  },
}));
