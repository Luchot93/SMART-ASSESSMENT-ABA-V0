import { ClipboardList } from 'lucide-react';
import { useMemo } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { FilterPills, SearchInput, SessionCard } from '@/components/session';

const AssessmentsPage = () => {
  const sessions = useSessionStore((s) => s.sessions);
  const filterStatus = useSessionStore((s) => s.filterStatus);
  const searchQuery = useSessionStore((s) => s.searchQuery);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions
      .filter((s) => filterStatus === 'all' || s.status === filterStatus)
      .filter(
        (s) =>
          !q ||
          s.clientName.toLowerCase().includes(q) ||
          s.bcbaName.toLowerCase().includes(q),
      );
  }, [sessions, filterStatus, searchQuery]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "'Instrument Sans', sans-serif", color: 'var(--text-primary)' }}
        >
          Assessments
        </h1>
        <button
          onClick={() =>
            useSessionStore.setState({ pendingToast: 'New interview coming soon' })
          }
          className="rounded-lg text-[13px] font-medium transition-colors duration-100"
          style={{ height: '36px', padding: '0 16px', background: 'var(--accent-teal)', color: '#fff' }}
        >
          + New Interview
        </button>
      </div>

      {/* Filters row */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <FilterPills />
        <SearchInput />
      </div>

      {/* Session list */}
      {filteredSessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-20">
    <ClipboardList size={48} style={{ color: 'var(--text-tertiary)' }} />
    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
      No assessments match your filters
    </p>
  </div>
);

export default AssessmentsPage;
