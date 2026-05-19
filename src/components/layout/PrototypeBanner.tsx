import { useState } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'prototype-banner-dismissed';

const PrototypeBanner = () => {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      className="relative flex h-9 flex-none items-center justify-center px-8 text-xs font-medium"
      style={{
        background: 'rgba(120,53,15,0.8)',
        color: 'var(--status-partial)',
      }}
    >
      Standalone prototype — data resets on refresh · Not connected to CRM
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        style={{ color: 'var(--status-partial)' }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default PrototypeBanner;
