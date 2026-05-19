import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';

export const SearchInput = () => {
  const setSearchQuery = useSessionStore((s) => s.setSearchQuery);
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSearchQuery(value), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, setSearchQuery]);

  return (
    <div
      className="relative flex items-center"
      style={{
        height: '34px',
        minWidth: '220px',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
      }}
    >
      <Search
        size={14}
        className="absolute left-2.5 flex-none"
        style={{ color: 'var(--text-secondary)' }}
      />
      <input
        type="text"
        placeholder="Search clients or BCBAs..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-full w-full bg-transparent pl-8 pr-7 text-[13px] outline-none placeholder:text-[var(--text-tertiary)]"
        style={{ color: 'var(--text-primary)' }}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-2 flex items-center justify-center"
          style={{ color: 'var(--text-tertiary)' }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
