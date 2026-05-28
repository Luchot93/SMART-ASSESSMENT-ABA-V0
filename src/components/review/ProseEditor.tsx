interface ProseEditorProps {
  content: string;
  onChange: (text: string) => void;
  onClose: () => void;
  saveState: 'idle' | 'saving' | 'saved';
}

export const ProseEditor = ({ content, onChange, onClose, saveState }: ProseEditorProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      <div
        className="flex items-center gap-1.5 text-[11px] font-medium"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span>✏</span>
        <span>Edit content — click Save & Close when done</span>
      </div>

      {/* Textarea */}
      <textarea
        autoFocus
        value={content}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          minHeight: 220,
          padding: '14px 16px',
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 14,
          lineHeight: 1.9,
          color: 'var(--text-clinical)',
          background: 'var(--surface-edit-active)',
          border: '1px solid rgba(0,0,0,0.10)',
          borderRadius: 6,
          resize: 'vertical',
          outline: 'none',
          boxShadow: '0 0 0 3px rgba(0,0,0,0.04)',
          boxSizing: 'border-box',
          overflowY: 'auto',
          transition: 'border-color 150ms ease',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,174,0.4)';
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 0 0 3px rgba(0,212,174,0.1)';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.10)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0,0,0,0.04)';
        }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-1.5 text-[13px] font-semibold transition-all duration-150"
          style={{
            background: 'var(--accent-teal)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.filter = 'none';
          }}
        >
          Save &amp; Close
        </button>

        {saveState !== 'idle' && (
          <span
            className="text-[11px] transition-opacity duration-300"
            style={{
              color:
                saveState === 'saved' ? 'var(--status-complete)' : 'var(--text-tertiary)',
            }}
          >
            {saveState === 'saving' ? 'saving…' : '✓ Saved'}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProseEditor;
