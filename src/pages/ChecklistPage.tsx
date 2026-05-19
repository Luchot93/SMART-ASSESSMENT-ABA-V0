import { ArrowLeft, Sparkles, Info } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { ChecklistRow, GenerateButton } from '@/components/checklist';
import { useSessionStore } from '@/store/sessionStore';
import { SECTION_ORDER } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ChecklistPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const session = useSessionStore((s) =>
    s.sessions.find((sess) => sess.id === sessionId) ?? null,
  );

  if (!session) return <Navigate to="/assessments" replace />;

  const interviewSections = SECTION_ORDER.filter((k) => k !== 'demographics');

  const complete = interviewSections.filter(
    (k) => session.sections[k].completionState === 'complete',
  ).length;
  const partial = interviewSections.filter(
    (k) => session.sections[k].completionState === 'partial',
  ).length;
  const empty = interviewSections.filter(
    (k) => session.sections[k].completionState === 'empty',
  ).length;
  const total = interviewSections.length;

  return (
    <div className="flex h-full flex-col">

      {/* ── Context bar ──────────────────────────────────────────────────────── */}
      <div
        className="z-10 flex flex-none items-center justify-between gap-4 px-5"
        style={{
          height: 48,
          background: 'var(--surface-card)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={`/assessments/${session.id}/interview`}
            className="flex flex-none items-center gap-1 text-[13px] transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            <ArrowLeft size={14} />
            Interview
          </Link>

          <span
            className="flex-none text-[11px]"
            style={{ color: 'var(--border-default)' }}
            aria-hidden
          >
            •
          </span>

          <span
            className="truncate text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {session.clientName}
          </span>

          <Badge status={session.status} />
        </div>

        <span className="flex-none text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
          {fmtDate(session.updatedAt)}
        </span>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-8">

          {/* ── Heading ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Sparkles size={18} style={{ color: 'var(--accent-teal)' }} />
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Ready to Generate
              </h1>
            </div>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              Review the data collected for each section before the AI drafts the assessment.
              You can tap any row to add or correct information.
            </p>
          </div>

          {/* ── Summary banner ────────────────────────────────────────────────── */}
          <div
            className="flex flex-wrap items-center gap-4 rounded-xl px-4 py-3.5"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <StatChip value={complete} label="complete" color="var(--status-complete)" />
            <StatChip value={partial}  label="partial"  color="var(--status-partial)"  />
            <StatChip value={empty}    label="empty"    color="var(--text-tertiary)"   />

            <div
              className="ml-auto h-4"
              style={{ borderLeft: '1px solid var(--border-subtle)' }}
            />

            <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {complete + partial}
              </span>
              /{total} sections have data
            </span>
          </div>

          {/* ── Info notice ───────────────────────────────────────────────────── */}
          <div
            className="flex items-start gap-2.5 rounded-lg px-3.5 py-2.5"
            style={{
              background: 'rgba(148,163,184,0.06)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Info size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              Empty sections will be skipped. Partial sections will be drafted with available data
              and flagged for review. The AI will not invent clinical information.
            </p>
          </div>

          {/* ── Section list (demographics first, then interview sections) ──────── */}
          <div className="flex flex-col gap-2">
            {/* Row 1 — Demographics (pre-interview form, not AI-drafted) */}
            <ChecklistRow
              sessionId={sessionId!}
              sectionKey="demographics"
              section={session.sections.demographics}
              index={1}
            />
            {/* Rows 2–11 — Interview sections */}
            {interviewSections.map((key, i) => (
              <ChecklistRow
                key={key}
                sessionId={sessionId!}
                sectionKey={key}
                section={session.sections[key]}
                index={i + 2}
              />
            ))}
          </div>

          {/* ── Generate button ───────────────────────────────────────────────── */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="mb-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              The AI will draft each section sequentially using your recordings, notes, and
              indicators. All output will be editable before you finalise the assessment.
            </p>
            <GenerateButton sessionId={sessionId!} />
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[15px] font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </span>
    </div>
  );
}

export default ChecklistPage;
