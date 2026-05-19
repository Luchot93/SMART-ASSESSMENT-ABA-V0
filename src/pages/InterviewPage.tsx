import { AlignJustify, ArrowLeft, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionCard } from '@/components/interview/SectionCard';
import { SectionSidebar } from '@/components/interview/SectionSidebar';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSessionStore } from '@/store/sessionStore';
import type { SectionKey } from '@/types';
import { SECTION_ORDER } from '@/types';

const InterviewPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const session = useSessionStore((s) =>
    s.sessions.find((sess) => sess.id === sessionId) ?? null,
  );
  const setActiveSession = useSessionStore((s) => s.setActiveSession);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (sessionId) setActiveSession(sessionId);
  }, [sessionId, setActiveSession]);

  // Auto-expand a section if ?expand=<sectionKey> is present in the URL
  useEffect(() => {
    const expandKey = searchParams.get('expand') as SectionKey | null;
    if (expandKey && SECTION_ORDER.includes(expandKey)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSectionKey(expandKey);
      setExpandedSections((prev) => {
        const next = new Set(prev);
        next.add(expandKey);
        return next;
      });
      setTimeout(() => {
        document
          .getElementById(`section-${expandKey}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setSearchParams({}, { replace: true });
      }, 120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSectionClick = useCallback((key: SectionKey) => {
    setActiveSectionKey(key);
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (window.innerWidth < 1024) next.clear();
      next.add(key);
      return next;
    });
    setMobileSidebarOpen(false);
    setTimeout(() => {
      document
        .getElementById(`section-${key}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const handleCardToggle = useCallback((key: SectionKey) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (window.innerWidth < 1024) next.clear();
        next.add(key);
        setActiveSectionKey(key);
      }
      return next;
    });
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useKeyboard({
    onExpandSection: handleSectionClick,
    onCollapseActive: useCallback(() => {
      if (activeSectionKey) {
        setExpandedSections((prev) => {
          const next = new Set(prev);
          next.delete(activeSectionKey);
          return next;
        });
        setActiveSectionKey(null);
      }
    }, [activeSectionKey]),
    enabled: !mobileSidebarOpen,
  });

  // Redirect to list if session not found
  if (!session) return <Navigate to="/assessments" replace />;

  const hasAnyData = session.sectionsWithData > 0;

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
            to="/assessments"
            className="flex flex-none items-center gap-1 text-[13px] transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={14} />
            Assessments
          </Link>

          <span className="flex-none text-[11px]" style={{ color: 'var(--border-default)' }} aria-hidden>•</span>

          <span className="truncate text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {session.clientName}
          </span>

          <Badge status={session.status} />
        </div>

        <button
          onClick={() => { if (hasAnyData) navigate(`/assessments/${session.id}/checklist`); }}
          disabled={!hasAnyData}
          className="flex-none rounded-lg px-4 text-[13px] font-medium transition-all duration-300"
          style={{
            height: 34,
            background: hasAnyData ? 'var(--accent-teal)' : 'var(--surface-elevated)',
            color: hasAnyData ? '#fff' : 'var(--text-tertiary)',
            cursor: hasAnyData ? 'pointer' : 'not-allowed',
            border: 'none',
          }}
          onMouseEnter={(e) => { if (hasAnyData) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = 'none'; }}
        >
          Ready to Generate →
        </button>
      </div>

      {/* ── Segmented progress bar ────────────────────────────────────────────── */}
      <div className="flex-none" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <ProgressBar sections={session.sections} />
      </div>

      {/* ── Two-column body ───────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Sidebar — desktop only (≥1024px) */}
        <div className="hidden lg:block">
          <SectionSidebar
            session={session}
            activeSectionKey={activeSectionKey}
            onSectionClick={handleSectionClick}
          />
        </div>

        {/* Section cards */}
        <div className="flex-1 overflow-y-auto p-5" style={{ scrollPaddingTop: 16 }}>
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {SECTION_ORDER.map((key) => (
              <SectionCard
                key={key}
                sessionId={sessionId!}
                sectionKey={key}
                isExpanded={expandedSections.has(key)}
                onToggle={() => handleCardToggle(key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Floating "Sections" button — mobile + tablet (<1024px) ───────────── */}
      <button
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-4 shadow-elevated lg:hidden"
        style={{
          height: 44,
          background: 'var(--surface-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
        }}
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open section navigation"
      >
        <AlignJustify size={16} />
        <span className="text-[13px] font-medium">Sections</span>
      </button>

      {/* ── Slide-in sidebar panel — mobile bottom sheet, tablet left panel ─── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden
          />

          {/* Mobile: bottom sheet / Tablet: left panel */}
          <div
            className="
              absolute bottom-0 left-0 right-0 flex flex-col rounded-t-2xl
              sm:bottom-auto sm:left-0 sm:top-0 sm:w-72 sm:rounded-none sm:rounded-r-2xl
            "
            style={{ background: 'var(--surface-card)', maxHeight: '75vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div
              className="flex flex-none items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Sections
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close section navigation"
              >
                <X size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <SectionSidebar
              session={session}
              activeSectionKey={activeSectionKey}
              onSectionClick={handleSectionClick}
              hideHeader
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
