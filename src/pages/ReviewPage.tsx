import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { DocumentSection } from '@/components/review';
import { useSessionStore } from '@/store/sessionStore';
import { getSectionConfig } from '@/utils/sectionConfig';
import { exportAssessment } from '@/utils/exportSimulator';
import { SECTION_ORDER } from '@/types';

// ─── Approval progress bar ────────────────────────────────────────────────────

interface ApprovalBarProps {
  approved: number;
  total: number;
  segments: boolean[];
}

const ApprovalBar = ({ approved, total, segments }: ApprovalBarProps) => (
  <div
    className="flex flex-none items-center gap-3 px-5"
    style={{ height: 36, borderBottom: '1px solid var(--border-subtle)' }}
  >
    <span className="text-[12px]" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
      <span
        className="font-semibold"
        style={{ color: approved === total ? 'var(--status-complete)' : 'var(--text-primary)' }}
      >
        {approved}
      </span>
      {' '}of {total} sections approved
    </span>

    <div className="flex flex-1 items-center gap-0.5">
      {segments.map((filled, i) => (
        <div
          key={i}
          className="flex-1 rounded-full transition-all duration-300"
          style={{
            height: 4,
            background: filled ? 'var(--accent-teal)' : 'var(--surface-elevated)',
          }}
        />
      ))}
    </div>
  </div>
);

// ─── Export button ────────────────────────────────────────────────────────────

interface ExportButtonProps {
  canExport: boolean;
  onClick: () => void;
  isExporting: boolean;
}

const ExportButton = ({ canExport, onClick, isExporting }: ExportButtonProps) => {
  const [phase, setPhase] = useState<'idle' | 'sweep' | 'glow'>('idle');
  const prevCanExport = useRef(false);

  // Trigger sweep → glow once when canExport first becomes true
  useEffect(() => {
    if (canExport && !prevCanExport.current) {
      setPhase('sweep');
      const t1 = setTimeout(() => setPhase('glow'), 400);
      const t2 = setTimeout(() => setPhase('idle'), 1200);
      prevCanExport.current = true;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (!canExport) prevCanExport.current = false;
  }, [canExport]);

  return (
    <div title={!canExport ? 'Approve or skip all sections to export' : undefined}>
      <button
        onClick={canExport && !isExporting ? onClick : undefined}
        disabled={!canExport || isExporting}
        className="relative flex flex-none items-center gap-2 overflow-hidden rounded-lg px-4 text-[13px] font-semibold transition-colors duration-200"
        style={{
          height: 34,
          background: canExport ? 'var(--surface-elevated)' : 'var(--surface-card)',
          color: canExport ? 'var(--text-primary)' : 'var(--text-tertiary)',
          border: canExport ? '1px solid var(--border-default)' : '1px solid var(--border-subtle)',
          cursor: canExport ? 'pointer' : 'not-allowed',
          animation: phase === 'glow' ? 'export-glow 800ms ease-out forwards' : 'none',
        }}
        onMouseEnter={(e) => {
          if (canExport) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.filter = 'none';
        }}
      >
        {/* Left-to-right sweep overlay */}
        {phase === 'sweep' && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--accent-teal)',
              animation: 'export-sweep 400ms ease-out forwards',
              zIndex: 0,
            }}
          />
        )}

        <span className="relative z-10 flex items-center gap-2">
          <Download size={13} />
          Export .docx
        </span>
      </button>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ReviewPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const session = useSessionStore((s) =>
    s.sessions.find((sess) => sess.id === sessionId) ?? null,
  );
  const canExportFn = useSessionStore((s) => s.canExport);
  const showToast = useSessionStore((s) => s.showToast);
  const markSessionComplete = useSessionStore((s) => s.markSessionComplete);

  const [isExporting, setIsExporting] = useState(false);

  if (!session) return <Navigate to="/assessments" replace />;

  const interviewSections = SECTION_ORDER.filter((k) => k !== 'demographics');
  const totalSections = interviewSections.length;

  const segments = interviewSections.map(
    (k) =>
      session.sections[k].approvalState === 'approved' ||
      session.sections[k].approvalState === 'skipped',
  );
  const approvedCount = segments.filter(Boolean).length;
  const exportReady = canExportFn(session.id);

  const handleExport = () => {
    if (!exportReady || isExporting) return;
    setIsExporting(true);
    exportAssessment(session, { showToast, markSessionComplete, navigate });
  };

  return (
    <div className="flex h-full flex-col">

      {/* ── Context bar ──────────────────────────────────────────────────── */}
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
            to={`/assessments/${session.id}/checklist`}
            className="flex flex-none items-center gap-1 text-[13px] transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={14} />
            Checklist
          </Link>

          <span className="flex-none text-[11px]" style={{ color: 'var(--border-default)' }} aria-hidden>•</span>

          <span className="flex-none text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Document Review
          </span>

          <span className="flex-none text-[11px]" style={{ color: 'var(--border-default)' }} aria-hidden>•</span>

          <span className="truncate text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {session.clientName}
          </span>

          <Badge status={session.status} />
        </div>

        <ExportButton canExport={exportReady} onClick={handleExport} isExporting={isExporting} />
      </div>

      {/* ── Approval progress bar ─────────────────────────────────────────── */}
      <ApprovalBar approved={approvedCount} total={totalSections} segments={segments} />

      {/* ── Document area ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-document)' }}>
        <div
          className="mx-auto py-8 px-4 md:px-8"
          style={{ maxWidth: 760 }}
        >
          {/* Document card */}
          <div
            style={{
              borderRadius: 12,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 4px 32px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Document header */}
            <div
              className="flex flex-col gap-1.5 px-8 py-6"
              style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
            >
              <p
                className="text-[11px] font-semibold uppercase"
                style={{ letterSpacing: '0.1em', color: '#94A3B8' }}
              >
                Initial Assessment Draft
              </p>
              <h1
                className="text-[22px] font-semibold"
                style={{ fontFamily: "'Lora', Georgia, serif", color: 'var(--text-clinical)' }}
              >
                {session.clientName}
              </h1>
              <p className="text-[13px]" style={{ color: '#64748B' }}>
                BCBA: {session.bcbaName} · Generated{' '}
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* All interview sections */}
            <div className="px-8 py-6">
              {interviewSections.map((key) => (
                <DocumentSection
                  key={key}
                  sessionId={sessionId!}
                  sectionKey={key}
                  config={getSectionConfig(key)}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 48 }} />
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
