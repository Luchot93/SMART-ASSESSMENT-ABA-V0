import { Menu } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useSessionStore } from '@/store/sessionStore';

interface TopBarProps {
  onMenuToggle: () => void;
}

const TopBar = ({ onMenuToggle }: TopBarProps) => {
  const { sessionId } = useParams<{ sessionId?: string }>();

  const clientName = useSessionStore((state) => {
    if (!sessionId) return null;
    return state.sessions.find((s) => s.id === sessionId)?.clientName ?? null;
  });

  return (
    <header
      className="flex h-14 flex-none items-center gap-3 border-b px-4"
      style={{
        background: 'var(--surface-card)',
        borderBottomColor: 'var(--border-subtle)',
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        aria-label="Open navigation"
        className="flex h-8 w-8 flex-none items-center justify-center rounded-md transition-colors hover:bg-white/5 md:hidden"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <nav className="flex flex-1 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        <Link
          to="/assessments"
          className="transition-colors hover:underline"
          style={{ color: clientName ? 'var(--text-secondary)' : 'var(--text-primary)' }}
        >
          Assessments
        </Link>
        {clientName && (
          <>
            <span style={{ color: 'var(--text-tertiary)' }}>/</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {clientName}
            </span>
          </>
        )}
      </nav>

      {/* Avatar */}
      <div
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[11px] font-semibold text-white"
        style={{ background: 'var(--accent-teal)' }}
        aria-label="Logged in as BC"
      >
        BC
      </div>
    </header>
  );
};

export default TopBar;
