import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSessionStore } from '@/store/sessionStore';
import { useToast } from '@/components/ui';
import PrototypeBanner from './PrototypeBanner';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * ToastBridge — watches the Zustand pendingToast and forwards it into the
 * rich Toast system. Clears the store value immediately so toasts don't repeat.
 */
function ToastBridge() {
  const pendingToast = useSessionStore((s) => s.pendingToast);
  const dismissToast = useSessionStore((s) => s.dismissToast);
  const toast = useToast();
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (pendingToast && pendingToast !== prevRef.current) {
      prevRef.current = pendingToast;
      toast.info(pendingToast);
      dismissToast();
    }
  }, [pendingToast, dismissToast, toast]);

  return null;
}

const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toast = useToast();

  const handleCrmFeatureClick = useCallback(() => {
    toast.info('CRM feature — not available in this prototype');
  }, [toast]);

  return (
    <div
      className="flex h-screen flex-col"
      style={{ background: 'var(--surface-app)' }}
    >
      <ToastBridge />
      <PrototypeBanner />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onCrmFeatureClick={handleCrmFeatureClick}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
