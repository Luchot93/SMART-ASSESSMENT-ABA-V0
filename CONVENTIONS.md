# Smart Assessment — Code Conventions

## Folder rules
- Components: src/components/[domain]/ComponentName.tsx — one component per file
- Each folder has an index.ts barrel that re-exports everything in the folder
- Pages: src/pages/ — pages import from components, never reverse
- Hooks: src/hooks/useXxx.ts — one hook per file
- Utils: src/utils/ — pure functions only, no React imports
- Types: src/types/index.ts — one file for all shared types
- Store: src/store/ — sessionStore.ts + mockData.ts only

## Naming conventions
- Components: PascalCase (SectionCard, RecordButton)
- Hooks: camelCase with "use" prefix (useAutoSave, useRecording)
- Utils: camelCase (getSectionConfig, exportSession)
- Types/interfaces: PascalCase (Session, SectionKey, ApprovalState)
- CSS variables: --kebab-case (--accent-teal, --surface-card)
- Zustand actions: camelCase verbs (setFilterStatus, updateSectionNotes)
- Event handlers: handle prefix (handleToggle, handleApprove)
- Boolean props: is/has/can prefix (isExpanded, hasQuickTap, canExport)

## Component structure (every component follows this order)
1. Imports: React, then external libs, then internal — alphabetical within groups
2. Props interface named [ComponentName]Props
3. Component function as arrow function, exported as named export
4. Default export at bottom

## TypeScript rules
- Strict mode. No "any". Use "unknown" if type is truly unknown.
- All props typed with explicit Props interface (not inline)
- No non-null assertions (!). Use optional chaining or type guards.
- Zustand store: explicit State and Actions interfaces

## Styling rules
- Use CSS variables for ALL colors: var(--token), never raw hex in JSX
- Tailwind for spacing, sizing, flex, grid
- className: group by concern: layout → appearance → state → transition
- No inline style objects except for dynamic CSS variable overrides
- Animations defined in globals.css @keyframes

## State management
- useState: UI-only state (isExpanded, tooltip visible)
- Zustand: all clinical data (sessions, sections, indicators, approval)
- No prop drilling beyond 2 levels — use store
- Derived values computed in selectors

## Import paths
- Always use @ alias: import { X } from '@/components/ui'
- Barrel imports preferred: import { Badge, Button } from '@/components/ui'

## Error handling
- All async in try/catch
- User-facing errors as toast notifications
- Recording errors shown inline in RecordButton
