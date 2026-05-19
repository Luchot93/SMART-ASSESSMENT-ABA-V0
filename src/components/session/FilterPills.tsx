import { useSessionStore } from '@/store/sessionStore';
import type { SessionStatus } from '@/types';

type FilterValue = SessionStatus | 'all';

const PILLS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Ready to Review', value: 'ready_to_review' },
  { label: 'Complete', value: 'complete' },
];

export const FilterPills = () => {
  const filterStatus = useSessionStore((s) => s.filterStatus);
  const setFilterStatus = useSessionStore((s) => s.setFilterStatus);

  return (
    <div className="flex flex-wrap gap-2">
      {PILLS.map(({ label, value }) => {
        const active = filterStatus === value;
        return (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className="text-[13px] font-medium transition-colors duration-100"
            style={{
              height: '34px',
              padding: '0 12px',
              borderRadius: '8px',
              background: active ? 'var(--accent-teal)' : 'var(--surface-card)',
              color: active ? '#fff' : 'var(--text-secondary)',
              border: active ? 'none' : '1px solid var(--border-default)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterPills;
