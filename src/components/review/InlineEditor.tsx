import { useCallback, useMemo, useRef, useState, useEffect, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pencil } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import type { SectionKey } from '@/types';
import { ProseEditor } from './ProseEditor';
import { SkillAcquisitionsEditor } from './SkillAcquisitionsEditor';

interface InlineEditorProps {
  sessionId: string;
  sectionKey: SectionKey;
  draftContent: string | null;
}

// ─── Placeholder injection ────────────────────────────────────────────────────

function injectPlaceholders(text: string): ReactNode[] {
  const PATTERN = /\[BCBA to complete:\s*([^\]]+)\]/gi;
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <span key={`ph-${i++}`} className="placeholder-block">
        [BCBA to complete: {match[1].trim()}]
      </span>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

function processChild(child: ReactNode, key: number): ReactNode {
  if (typeof child === 'string' && /\[BCBA to complete:/i.test(child)) {
    return <span key={key}>{injectPlaceholders(child)}</span>;
  }
  return child;
}

function processChildren(children: ReactNode): ReactNode {
  const arr = Array.isArray(children) ? children : [children];
  return <>{arr.map((c, i) => processChild(c as ReactNode, i))}</>;
}

// ─── Markdown component overrides (view-only — no click-to-edit) ──────────────

const VIEW_COMPONENTS = {
  p: ({ children }: { children?: ReactNode }) => (
    <p
      style={{
        fontFamily: "'Lora', Georgia, serif",
        fontSize: 14,
        lineHeight: 1.9,
        color: 'var(--text-clinical)',
        margin: '0 0 10px',
      }}
    >
      {processChildren(children)}
    </p>
  ),

  strong: ({ children }: { children?: ReactNode }) => (
    <strong
      style={{
        display: 'block',
        fontFamily: "'Instrument Sans', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: 'var(--text-clinical)',
        marginTop: 18,
        marginBottom: 8,
        lineHeight: 1.4,
      }}
    >
      {children}
    </strong>
  ),

  hr: () => (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        margin: '22px 0',
      }}
    />
  ),

  table: ({ children }: { children?: ReactNode }) => (
    <div
      style={{
        overflowX: 'auto',
        margin: '10px 0 16px',
        borderRadius: 6,
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: 560,
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          fontFamily: "'Instrument Sans', system-ui, sans-serif",
        }}
      >
        {children}
      </table>
    </div>
  ),

  thead: ({ children }: { children?: ReactNode }) => (
    <thead style={{ background: 'rgba(0,212,174,0.06)' }}>{children}</thead>
  ),

  tbody: ({ children }: { children?: ReactNode }) => <tbody>{children}</tbody>,

  tr: ({ children }: { children?: ReactNode }) => (
    <tr className="md-table-row" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      {children}
    </tr>
  ),

  th: ({ children }: { children?: ReactNode }) => (
    <th
      style={{
        padding: '8px 11px',
        borderBottom: '2px solid rgba(0,212,174,0.22)',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        textAlign: 'left',
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: '#5A7184',
        wordBreak: 'break-word' as const,
        lineHeight: 1.4,
      }}
    >
      {children}
    </th>
  ),

  td: ({ children }: { children?: ReactNode }) => (
    <td
      style={{
        padding: '8px 11px',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        verticalAlign: 'top',
        lineHeight: 1.65,
        fontSize: 13,
        color: 'var(--text-clinical)',
        wordBreak: 'break-word' as const,
        whiteSpace: 'normal' as const,
      }}
    >
      {processChildren(children)}
    </td>
  ),
};

// ─── Component ────────────────────────────────────────────────────────────────

export const InlineEditor = ({ sessionId, sectionKey, draftContent }: InlineEditorProps) => {
  const setDraftContent = useSessionStore((s) => s.setDraftContent);
  const markSectionEdited = useSessionStore((s) => s.markSectionEdited);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(draftContent ?? '');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const hasMarkedEdited = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local edit text when draft content changes externally (e.g. after generation)
  useEffect(() => {
    if (!isEditing) {
      setEditText(draftContent ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftContent]);

  // Memoised — stable object so ReactMarkdown doesn't remount on every render
  const components = useMemo(() => VIEW_COMPONENTS, []);

  // ── Autosave ──────────────────────────────────────────────────────────────

  const scheduleAutoSave = useCallback(
    (text: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveState('saving');
      saveTimerRef.current = setTimeout(() => {
        setDraftContent(sessionId, sectionKey, text, 'drafted');
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1800);
      }, 1500);
    },
    [sessionId, sectionKey, setDraftContent],
  );

  // ── Handlers passed to sub-editors ───────────────────────────────────────

  const handleChange = useCallback(
    (text: string) => {
      setEditText(text);
      if (!hasMarkedEdited.current) {
        hasMarkedEdited.current = true;
        markSectionEdited(sessionId, sectionKey);
      }
      scheduleAutoSave(text);
    },
    [markSectionEdited, scheduleAutoSave, sessionId, sectionKey],
  );

  const handleClose = useCallback(() => {
    // Flush any pending debounced save immediately
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setDraftContent(sessionId, sectionKey, editText, 'drafted');
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 1800);
    setIsEditing(false);
  }, [sessionId, sectionKey, editText, setDraftContent]);

  // ── Edit mode ─────────────────────────────────────────────────────────────

  if (isEditing) {
    const sharedProps = {
      content: editText,
      onChange: handleChange,
      onClose: handleClose,
      saveState,
    };

    return (
      <div style={{ padding: '4px 0' }}>
        {sectionKey === 'skill_acquisitions' ? (
          <SkillAcquisitionsEditor {...sharedProps} sessionId={sessionId} />
        ) : (
          <ProseEditor {...sharedProps} />
        )}
      </div>
    );
  }

  // ── View mode ─────────────────────────────────────────────────────────────

  return (
    <div
      className="draft-markdown-wrapper relative"
      style={{ padding: '4px 0' }}
    >
      {/* Hover-revealed pencil edit button */}
      <button
        className="edit-pencil-btn"
        onClick={() => setIsEditing(true)}
        title="Edit section content"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid rgba(0,0,0,0.10)',
          background: '#FFFFFF',
          color: 'var(--text-secondary)',
          fontSize: 11,
          fontFamily: "'Instrument Sans', system-ui, sans-serif",
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-teal)';
          (e.currentTarget as HTMLElement).style.color = 'var(--accent-teal)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.10)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
        }}
      >
        <Pencil size={11} />
        Edit
      </button>

      {/* Rendered Markdown */}
      <div className="draft-markdown" style={{ padding: '2px 14px 2px' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {draftContent ?? ''}
        </ReactMarkdown>
      </div>

      {/* Save indicator (visible after edits even in view mode) */}
      {saveState !== 'idle' && (
        <div
          className="absolute bottom-1 right-3 text-[11px]"
          style={{
            color:
              saveState === 'saved' ? 'var(--status-complete)' : 'var(--text-tertiary)',
          }}
        >
          {saveState === 'saving' ? 'saving…' : '✓ Saved'}
        </div>
      )}
    </div>
  );
};

export default InlineEditor;
