import { useSessionStore } from '@/store/sessionStore';
import type { SectionKey } from '@/types';

interface RevertConfirmProps {
  sessionId: string;
  sectionKey: SectionKey;
  onCancel: () => void;
}

export const RevertConfirm = ({ sessionId, sectionKey, onCancel }: RevertConfirmProps) => {
  const revertToAiOriginal = useSessionStore((s) => s.revertToAiOriginal);
  const showToast = useSessionStore((s) => s.showToast);

  const handleRevert = () => {
    revertToAiOriginal(sessionId, sectionKey);
    showToast('Reverted to AI draft');
    onCancel();
  };

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3"
      style={{
        background: 'rgba(248,113,113,0.05)',
        border: '1px solid rgba(248,113,113,0.2)',
        borderRadius: 8,
      }}
    >
      <p className="text-[12px]" style={{ color: 'var(--text-clinical-muted)' }}>
        Revert to AI original? Your edits will be lost.
      </p>

      <div className="flex items-center gap-2">
        {/* Cancel */}
        <button
          onClick={onCancel}
          className="rounded px-3 py-1.5 text-[12px] font-medium transition-colors duration-150"
          style={{ color: 'var(--text-clinical-muted)', background: 'transparent' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-clinical)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-clinical-muted)';
          }}
        >
          Cancel
        </button>

        {/* Revert */}
        <button
          onClick={handleRevert}
          className="rounded px-3 py-1.5 text-[12px] font-semibold transition-all duration-150"
          style={{
            background: 'rgba(248,113,113,0.12)',
            color: '#B91C1C',
            border: '1px solid rgba(248,113,113,0.35)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.12)';
          }}
        >
          Revert
        </button>
      </div>
    </div>
  );
};

export default RevertConfirm;
