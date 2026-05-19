import { BarChart2, ClipboardList, LayoutGrid, Settings, Users, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  isCrm: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutGrid, label: 'Pipeline', isCrm: true },
  { icon: Users, label: 'Clients', isCrm: true },
  { icon: ClipboardList, label: 'Assessments', path: '/assessments', isCrm: false },
  { icon: BarChart2, label: 'Reports', isCrm: true },
  { icon: Settings, label: 'Settings', isCrm: true },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onCrmFeatureClick: () => void;
}

interface NavItemRowProps {
  item: NavItem;
  isActive: boolean;
  expanded: boolean;
  onCrmFeatureClick: () => void;
}

const NavItemRow = ({ item, isActive, expanded, onCrmFeatureClick }: NavItemRowProps) => {
  const Icon = item.icon;

  const innerContent = (
    <>
      {/* Active indicator bar */}
      <span
        className={cn(
          'absolute left-0 top-1 h-[calc(100%-8px)] w-[3px] rounded-r-sm transition-colors duration-150',
          isActive ? 'bg-accent-teal' : 'bg-transparent',
        )}
      />

      {/* Icon */}
      <Icon
        size={18}
        className={cn(
          'flex-none transition-colors duration-150',
          expanded ? 'mx-0' : 'mx-auto lg:mx-0',
          isActive ? 'text-accent-teal' : 'text-text-secondary group-hover:text-accent-teal',
        )}
      />

      {/* Label */}
      <span className={expanded ? 'inline' : 'hidden lg:inline'}>{item.label}</span>

      {/* Tooltip — icon-only desktop mode only (not mobile overlay, not full sidebar) */}
      {!expanded && (
        <span
          className={cn(
            'pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2',
            'whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium',
            'opacity-0 shadow-elevated transition-opacity duration-150 group-hover:opacity-100',
            'lg:hidden',
          )}
          style={{
            background: 'var(--surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          }}
          role="tooltip"
        >
          {item.label}
          {item.isCrm && (
            <span className="ml-1.5" style={{ color: 'var(--text-tertiary)' }}>
              CRM
            </span>
          )}
        </span>
      )}
    </>
  );

  const sharedClassName = cn(
    'group relative flex w-full items-center gap-3 py-2.5 pl-3 pr-2 text-sm',
    'transition-colors duration-150 rounded-sm',
    isActive
      ? 'text-text-primary'
      : 'text-text-secondary hover:bg-surface-card-hover',
    isActive && 'bg-accent-teal-muted',
  );

  if (item.isCrm) {
    return (
      <button className={cn(sharedClassName, 'w-full text-left')} onClick={onCrmFeatureClick}>
        {innerContent}
      </button>
    );
  }

  return (
    <Link to={item.path!} className={sharedClassName}>
      {innerContent}
    </Link>
  );
};

const SidebarContent = ({
  onMobileClose,
  onCrmFeatureClick,
  isMobile = false,
}: {
  onMobileClose: () => void;
  onCrmFeatureClick: () => void;
  isMobile?: boolean;
}) => {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col" style={{ borderRight: '1px solid var(--border-subtle)' }}>
      {/* Logo */}
      <div
        className="flex h-14 flex-none items-center gap-2 px-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span
          className="flex-none text-sm font-bold"
          style={{ color: 'var(--accent-teal)' }}
        >
          {isMobile ? 'AWC' : (
            <>
              <span className="lg:hidden">A</span>
              <span className="hidden lg:inline">AWC</span>
            </>
          )}
        </span>
        <span
          className={isMobile ? 'truncate text-[13px]' : 'hidden truncate text-[13px] lg:block'}
          style={{ color: 'var(--text-secondary)' }}
        >
          Behavioral Health
        </span>

        {/* Close button — mobile overlay only */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="ml-auto flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              !item.isCrm &&
              !!item.path &&
              location.pathname.startsWith(item.path);
            return (
              <li key={item.label}>
                <NavItemRow
                  item={item}
                  isActive={isActive}
                  expanded={isMobile}
                  onCrmFeatureClick={onCrmFeatureClick}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

const Sidebar = ({ mobileOpen, onMobileClose, onCrmFeatureClick }: SidebarProps) => (
  <>
    {/* Desktop sidebar: icon-only at md (768–1023px), full at lg (1024px+) */}
    <aside
      className="hidden flex-none md:flex md:w-12 lg:w-60"
      style={{ background: 'var(--surface-card)' }}
    >
      <SidebarContent
        onMobileClose={onMobileClose}
        onCrmFeatureClick={onCrmFeatureClick}
      />
    </aside>

    {/* Mobile slide-in overlay */}
    {mobileOpen && (
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onMobileClose}
          aria-hidden="true"
        />
        {/* Panel */}
        <aside
          className="absolute left-0 top-0 flex h-full w-60 flex-col"
          style={{ background: 'var(--surface-card)' }}
        >
          <SidebarContent
            onMobileClose={onMobileClose}
            onCrmFeatureClick={onCrmFeatureClick}
            isMobile
          />
        </aside>
      </div>
    )}
  </>
);

export default Sidebar;
