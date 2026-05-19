# CRM Integration Guide

This app is designed to be embedded into the ABA CRM after BCBA validation.
The boundary between portable and replaceable code is documented below.

## Keep

These modules are framework-agnostic and plug directly into the CRM:

- **`/interview`, `/checklist`, `/review` components** — all domain UI; no shell dependencies
- **`/hooks`** — all custom hooks; depend only on Zustand store and browser APIs
- **`sectionConfig.ts`** — static configuration, no routing or shell imports
- **`types/index.ts`** — shared TypeScript types; import as-is
- **Design tokens** — CSS variables in `src/styles/` and `src/index.css`

## Replace

These are standalone-app scaffolding that the CRM already provides:

| This app | CRM equivalent |
|---|---|
| `AppShell` / `Sidebar` / `TopBar` | CRM shell components |
| `App.tsx` | Nest routes into CRM router |
| `sessionStore.ts` | Supabase query hooks / CRM data layer |
| `mockData.ts` | Remove — use real Supabase data |

## Integration steps

1. Copy `src/components/interview`, `src/components/checklist`, `src/components/review` into the CRM component tree
2. Copy `src/hooks/`, `src/types/index.ts`, `src/utils/` verbatim
3. Add the assessment routes to the CRM router (e.g. `/assessment/:sessionId`)
4. Replace `sessionStore.ts` with Supabase query equivalents; keep the same exported interface so components require no changes
5. Remove `mockData.ts` and seed from the CRM's real data layer
6. Verify design tokens don't conflict with CRM tokens; rename with `--sa-` prefix if needed
