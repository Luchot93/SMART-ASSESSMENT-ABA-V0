# SMART Assessment — ABA Clinical Documentation Platform

> **Status:** V0 Prototype · Active Development · Standalone product — CRM integration planned

A clinical workflow tool for Board Certified Behavior Analysts (BCBAs) at **AWC Behavioral Health**, designed to replace manual ABA assessment documentation with a structured, AI-assisted interview-to-document pipeline.

---

## What It Does

BCBAs conducting ABA Initial Assessments currently spend hours writing clinical reports from handwritten notes and fragmented recordings. This platform guides the BCBA through a structured 11-section interview, captures recordings and behavioral indicators in real time, and uses AI to generate a complete, editable draft of the clinical assessment document — ready for section-by-section review, approval, and export.

The output maps directly to the **AWC Behavioral Health Initial Assessment Template**, the Medicaid-required document used to authorize ABA therapy services.

---

## Core Workflow

```
Client Session
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  INTERVIEW  (/assessments/:id/interview)            │
│                                                     │
│  • Demographics pre-filled from CRM                 │
│  • 11 guided interview sections                     │
│  • Per-section: record audio · take notes ·         │
│    tap behavioral indicators · follow prompts       │
│  • Skill acquisition goal builder with AI-          │
│    generated operational definitions                │
└─────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  PRE-GENERATE CHECKLIST  (/assessments/:id/checklist)│
│                                                     │
│  • 11-row readiness review                          │
│  • See what data was captured per section           │
│  • Return to any section to add missing info        │
│  • Trigger AI draft generation (Anthropic Claude)   │
│  • Grammar check pass on all drafted sections       │
└─────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  DOCUMENT REVIEW  (/assessments/:id/review)         │
│                                                     │
│  • Rendered Markdown document view (tables,         │
│    bold headers, clinical formatting)               │
│  • Friendly inline editors — prose textarea for     │
│    narrative sections, structured goal form for     │
│    Skill Acquisitions                               │
│  • Section-by-section approve / skip / revert       │
│  • Export when all sections resolved                │
└─────────────────────────────────────────────────────┘
     │
     ▼
  Exported Assessment Document (.json → .docx planned)
  → Submitted for Medicaid authorization
```

---

## Interview Sections

| # | Section | What Gets Captured |
|---|---------|-------------------|
| 1 | Demographics & Referral | Client info, diagnosis, insurance, assessment type |
| 2 | Presenting Concerns | Chief complaint, functional impact, diagnostic history |
| 3 | Self-Help Skills | Toileting, feeding, dressing, hygiene, sleep |
| 4 | Daily Living Skills | Directions, routines, transitions, task engagement |
| 5 | Safety Concerns | Elopement, aggression, SIB, property destruction |
| 6 | Communication | Modality, requesting, expressive/receptive, AAC |
| 7 | Self-Stimulatory Behavior | Topography, function, frequency, impact |
| 8 | Medical Necessity | Functional impact, risk level, CPT codes |
| 9 | Skill Acquisitions | Structured goal builder: op defs, baselines, teaching strategies, mastery criteria |
| 10 | Behavior Targets | Operational definitions, baselines, triggers, indicators |
| 11 | Crisis Plan | De-escalation, emergency contacts, restraint protocols |

---

## Recent Updates (V0 — May 2026)

- **AI draft generation** — Live Anthropic Claude API integration. Skill Acquisitions section generates a structured clinical table (operational definition, STO/LTO data table, teaching strategies, generalization plan) from the goal builder data. Falls back to a structured template when no API key is configured.
- **Markdown document rendering** — Review page renders clinical content as formatted HTML: bold goal headers, bordered data tables with fixed column layout, `[BCBA to complete]` amber placeholder spans.
- **Friendly inline editors** — Prose sections open a clean Lora-serif textarea. Skill Acquisitions opens a structured form with labeled fields per goal (no raw Markdown exposed to clinicians).
- **Hover-reveal edit button** — Pencil icon appears on hover; no accidental edit-mode triggers.
- **Full Marcus seed data** — All 11 sections pre-filled with realistic clinical interview content and transcripts for end-to-end testing.
- **Client name substitution** — Guided interview prompts replace `[client]` placeholders with the actual client's first name in real time.
- **Transcript copy + flag** — BCBAs can copy any transcript to clipboard or flag it to deprioritize it in AI generation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| State | Zustand (single store, no persistence) |
| AI Generation | Anthropic Claude API (`claude-sonnet-4`) |
| Markdown Rendering | `react-markdown` + `remark-gfm` |
| Grammar Check | LanguageTool public API |
| Icons | Lucide React |
| Fonts | Instrument Sans · Lora |

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Optional — AI draft generation

The Skill Acquisitions section uses the Anthropic API for AI-formatted clinical prose. Without a key, it falls back to a structured template that formats the goal builder data automatically.

To enable AI generation:

```bash
# Create .env in the project root
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

All other sections use pre-built mock prose — no API key required.

---

## Mock Sessions

Four pre-seeded sessions demonstrate the full workflow:

| Client | Status | Description |
|--------|--------|-------------|
| Marcus D. | `in_progress` | All 10 interview sections fully seeded with realistic notes, transcripts, and 2 skill acquisition goals — ready to generate a complete draft |
| Sofia R. | `ready_to_review` | All sections complete, AI drafts generated — demonstrates the review workflow |
| Jaylen T. | `complete` | All sections approved and exported — demonstrates the completed state |
| Emma W. | `in_progress` | 3 sparse sections, consent not yet granted — demonstrates an early-stage session |

---

## Design System

All color, surface, and spacing values are CSS custom properties defined in `src/styles/globals.css`. Components reference only `var(--token-name)` — no hardcoded colors anywhere. The token set is aligned with the AWC CRM product styling contract to simplify future integration.

Key tokens:
- `--accent-teal` / `--accent-teal-muted` — primary actions
- `--surface-card` / `--surface-elevated` — layered surfaces
- `--status-complete` / `--status-partial` / `--status-missing` — section states
- `--text-primary` / `--text-secondary` / `--text-tertiary` — type hierarchy

---

## Project Structure

```
src/
  store/
    sessionStore.ts     Zustand store — all state and actions
    mockData.ts         4 pre-seeded sessions with realistic ABA data
  pages/
    AssessmentsPage     Session list with filter + search
    InterviewPage       Main data-capture page (sidebar + section cards)
    ChecklistPage       Pre-generate readiness review (11 rows)
    ReviewPage          Document editing, approval, export
  components/
    interview/          DemographicsForm, SectionCard, RecordButton,
                        BehavioralIndicators, SkillAcquisitionsPanel,
                        SkillGoalCard, GuidedPrompts, TranscriptPanel …
    review/             DocumentSection, InlineEditor, ProseEditor,
                        SkillAcquisitionsEditor, ActionRow, ConflictFlag …
    checklist/          ChecklistRow, GenerateButton
    ui/                 Badge, ProgressBar, Toast
    layout/             AppShell, Sidebar, TopBar, PrototypeBanner
  utils/
    grammarCheck        LanguageTool API integration
    exportSimulator     JSON download + session completion
    sectionConfig       Section metadata (title, prompts, number)
  styles/
    globals.css         All CSS custom properties (design tokens)
  types/
    index.ts            Session, Section, ClientProfile, SectionKey interfaces
```

---

## CRM Integration — Upcoming

> **This standalone product will be integrated into the AWC CRM platform in the coming development cycle.**

The SMART Assessment tool is currently built as a standalone React SPA to allow rapid iteration on the clinical workflow and AI generation pipeline. The next major phase will embed it directly into the AWC CRM as a module, replacing the current standalone deployment.

### Planned integration points

| Integration | Description |
|---|---|
| **Client profile auto-fill** | Demographics section pre-populated from the CRM client record on session creation — no re-entry |
| **Session creation from CRM** | BCBA initiates an assessment directly from the client's CRM profile; session is linked to the client ID |
| **BCBA identity from CRM auth** | Logged-in BCBA identity flows into the session automatically — no hardcoded identity |
| **Assessment history** | Completed assessments stored against the client record in CRM — accessible for reassessments and progress reviews |
| **Authorization workflow** | Exported assessment document fed into the CRM's prior-auth submission workflow |
| **Notification hooks** | CRM triggers a notification when an assessment is ready for BCBA review or supervisor sign-off |

### Design alignment

The token system (`--accent-teal`, `--surface-card`, etc.) was intentionally matched to the AWC CRM styling contract. Component patterns (section cards, state badges, action rows) follow the same conventions as the CRM UI library to minimize migration effort.

### What stays the same

The core interview → checklist → review → export workflow, the AI generation pipeline, and the section data model are all designed to be backend-agnostic. The Zustand store will be replaced with API calls backed by the CRM's Supabase instance — the UI layer requires minimal changes.

---

## Current Limitations (V0 Prototype)

| Area | Current State |
|------|--------------|
| Recording | Simulated — no real audio capture or STT transcription |
| AI Drafts | Live for Skill Acquisitions (Anthropic API); mock prose for other sections |
| Export | JSON file — `.docx` export with full clinical formatting planned |
| Persistence | In-memory only — resets on refresh; no backend |
| Auth | Hardcoded BCBA identity per session |
| Grammar Check | Real LanguageTool API — rate limited |

---

## Roadmap — V1 Backend Phase

1. **PDF / DOCX export** — Rendered clinical document with full table formatting, matching the AWC assessment template exactly
2. **AI drafts for all sections** — Anthropic Claude generating narrative prose from interview notes + transcripts for all 11 sections
3. **Real audio recording → Whisper STT** — Live transcription pipeline replacing the simulated recording
4. **Supabase backend** — Persistent sessions, sections, drafts, and audit log
5. **CRM integration** — Client profile auto-populated from AWC CRM, assessment linked to client record
6. **7 additional interview sections** — Strengths & Weaknesses, Reinforcement Assessment, Hypothesis-Based Interventions, Intervention Techniques, Caregiver Training Goals, Service Hours + CPT codes, Phase-Based Treatment Plan
7. **Structured behavior targets** — Per-behavior table with operational definitions, baselines, LTO/STO goals
8. **Auth** — BCBA login tied to real identity for audit trail and supervisor sign-off

---

## Documentation

- [`CONVENTIONS.md`](./CONVENTIONS.md) — Code style, component patterns, naming rules
- [`INTEGRATION.md`](./INTEGRATION.md) — CRM merge guide for backend phase

---

*Built for AWC Behavioral Health — ABA clinical documentation platform*
