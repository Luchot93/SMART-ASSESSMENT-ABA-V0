# SMART Assessment — ABA Clinical Documentation Platform

> **Status:** V0 Prototype · UI complete · Backend integration in progress

A clinical workflow tool for Board Certified Behavior Analysts (BCBAs) at **AWC Behavioral Health**, designed to replace manual ABA assessment documentation with a structured, AI-assisted interview-to-document pipeline.

---

## What It Does

BCBAs conducting ABA Initial Assessments currently spend hours writing clinical reports from handwritten notes and fragmented recordings. This platform guides the BCBA through a structured 11-section interview, captures recordings and behavioral indicators in real time, and uses AI to generate a complete, editable draft of the clinical assessment document — ready for review, approval, and export.

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
└─────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  PRE-GENERATE CHECKLIST  (/assessments/:id/checklist)│
│                                                     │
│  • 11-row readiness review                          │
│  • See what data was captured per section           │
│  • Return to any section to add missing info        │
│  • Trigger AI draft generation                      │
└─────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  DOCUMENT REVIEW  (/assessments/:id/review)         │
│                                                     │
│  • Inline-editable AI draft document                │
│  • Section-by-section approve / skip / revert       │
│  • Export when all sections resolved                │
└─────────────────────────────────────────────────────┘
     │
     ▼
  Exported Assessment Document (.docx)
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
| 9 | Skill Acquisitions | Replacement behaviors, skill targets *(in development)* |
| 10 | Behavior Targets | Operational definitions, baselines, triggers |
| 11 | Crisis Plan | De-escalation, emergency contacts, restraint protocols |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| State | Zustand (single store, no persistence) |
| Icons | Lucide React |
| Fonts | Instrument Sans · Lora |
| Grammar Check | LanguageTool public API |

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

No environment variables required for the prototype — all data is seeded in-memory and resets on refresh.

---

## Mock Sessions

Four pre-seeded sessions demonstrate the full workflow:

| Client | Status | Description |
|--------|--------|-------------|
| Marcus D. | `in_progress` | 6 of 11 sections captured, demographics pre-filled |
| Sofia R. | `ready_to_review` | All sections complete, AI drafts generated |
| Jaylen T. | `complete` | All sections approved and exported |
| Emma W. | `in_progress` | 3 sparse sections, consent not yet granted |

---

## Design System

All color, surface, and spacing values are CSS custom properties defined in `src/styles/globals.css`. Components reference only `var(--token-name)` — no hardcoded colors anywhere. The token set matches the AWC CRM product styling contract.

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
    interview/          DemographicsForm, SectionCard, RecordButton, BehavioralIndicators …
    review/             DocumentSection, InlineEditor, ActionRow …
    checklist/          ChecklistRow, GenerateButton
    ui/                 Badge, ProgressBar, Toast
    layout/             AppShell, Sidebar, TopBar, PrototypeBanner
  hooks/
    useAutoSave         Debounced save with isSaving / lastSavedAt
    useKeyboard         Escape + Alt+1–9 section shortcuts
  utils/
    grammarCheck        LanguageTool API integration
    exportSimulator     JSON download + session completion
    sectionConfig       Section metadata (title, prompts, isSupposition)
  styles/
    globals.css         All CSS custom properties (design tokens)
  types/
    index.ts            Session, Section, ClientProfile, SectionKey interfaces
```

---

## Current Limitations (V0 Prototype)

| Area | Current State |
|------|--------------|
| Recording | Simulated — no real audio capture or STT |
| AI Drafts | Mock prose — no live LLM calls |
| Grammar Check | Real LanguageTool API — rate limited |
| Export | JSON file — not a real `.docx` yet |
| Persistence | Resets on refresh — no backend |
| Auth | Hardcoded BCBA identity per session |

---

## Roadmap — V1 Backend Phase

The following are being scoped for the next development phase:

1. **7 additional interview sections** — Strengths & Weaknesses, Reinforcement Assessment, Hypothesis-Based Interventions, Intervention Techniques checklist, Caregiver Training Goals, Service Hours + CPT codes, Phase-Based Treatment Plan
2. **Structured behavior targets** — Per-behavior table with operational definitions, baselines, LTO/STO goals
3. **Supabase backend** — Sessions, sections, drafts, and audit log with real persistence
4. **Audio recording → Whisper STT** — Real transcription pipeline
5. **AI draft generation** — OpenAI / Anthropic replacing mock prose
6. **True `.docx` export** — Via `docx` npm package, matching the AWC template exactly
7. **CRM integration** — Client profile auto-populated from AWC CRM on session creation
8. **Auth** — BCBA login tied to real identity for audit trail

---

## Documentation

- [`CONVENTIONS.md`](./CONVENTIONS.md) — Code style, component patterns, naming rules
- [`INTEGRATION.md`](./INTEGRATION.md) — CRM merge guide for backend phase

---

*Built for AWC Behavioral Health — ABA clinical documentation platform*
