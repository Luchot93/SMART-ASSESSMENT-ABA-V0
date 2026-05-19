import { useCallback, useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import type { SectionKey } from '@/types';

interface InlineEditorProps {
  sessionId: string;
  sectionKey: SectionKey;
  draftContent: string | null;
}

// ─── Content parsing ──────────────────────────────────────────────────────────

/** Convert draftContent string → safe HTML for contenteditable rendering */
function parseContentForEditor(text: string): string {
  if (!text) return '';
  // Escape HTML entities
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Newlines → <br>
  const withBreaks = escaped.replace(/\n/g, '<br>');

  // [BCBA to complete: X] → styled inline span
  return withBreaks.replace(
    /\[BCBA to complete:\s*([^\]]+)\]/gi,
    (_, desc: string) =>
      `<span class="placeholder-block" contenteditable="false" tabindex="0">[BCBA to complete: ${desc.trim()}]</span>`,
  );
}

/** Extract plain text from contenteditable div (converts <br> back to \n) */
function extractText(el: HTMLDivElement): string {
  // Walk the DOM to preserve line breaks correctly
  const parts: string[] = [];
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent ?? '');
    } else if (node.nodeName === 'BR') {
      parts.push('\n');
    } else if (node.nodeName === 'SPAN' && (node as Element).classList.contains('placeholder-block')) {
      // Preserve placeholder text verbatim
      parts.push((node as Element).textContent ?? '');
    } else {
      // For block elements (divs inserted by contenteditable), prepend \n
      const isBlock =
        node.nodeName === 'DIV' || node.nodeName === 'P';
      if (isBlock && parts.length > 0 && !parts[parts.length - 1].endsWith('\n')) {
        parts.push('\n');
      }
      node.childNodes.forEach(walk);
    }
  };
  el.childNodes.forEach(walk);
  return parts.join('').replace(/\n$/, ''); // trim trailing newline
}

// ─── Component ────────────────────────────────────────────────────────────────

const TOOLTIP_KEY = 'inline-editor-tooltip-shown';

export const InlineEditor = ({ sessionId, sectionKey, draftContent }: InlineEditorProps) => {
  const setDraftContent = useSessionStore((s) => s.setDraftContent);
  const markSectionEdited = useSessionStore((s) => s.markSectionEdited);

  const divRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMarkedEdited = useRef(false);

  const [isFocused, setIsFocused] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initialise / re-initialise contenteditable from store ─────────────────

  useEffect(() => {
    if (!divRef.current || isTypingRef.current) return;
    divRef.current.innerHTML = parseContentForEditor(draftContent ?? '');
  }, [draftContent]);

  // ── Placeholder click: dissolve bg + select text ──────────────────────────

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('placeholder-block')) {
      // Dissolve animation
      target.classList.add('dissolving');
      // Make it editable so the user can type in place
      target.removeAttribute('contenteditable');
      target.setAttribute('contenteditable', 'true');

      // Select all text inside the span so first keystroke replaces it
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, []);

  // ── Hover: show once-only tooltip ─────────────────────────────────────────

  const handleMouseEnter = useCallback(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem(TOOLTIP_KEY)) {
      setShowTooltip(true);
      tooltipTimerRef.current = setTimeout(() => {
        setShowTooltip(false);
        sessionStorage.setItem(TOOLTIP_KEY, '1');
      }, 3000);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    setShowTooltip(false);
  }, []);

  // ── Auto-save ─────────────────────────────────────────────────────────────

  const scheduleAutoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveState('saving');

    saveTimerRef.current = setTimeout(() => {
      if (!divRef.current) return;
      const text = extractText(divRef.current);
      setDraftContent(sessionId, sectionKey, text, 'drafted');
      setSaveState('saved');

      setTimeout(() => setSaveState('idle'), 1800);
    }, 2000);
  }, [sessionId, sectionKey, setDraftContent]);

  // ── Input handler ─────────────────────────────────────────────────────────

  const handleInput = useCallback(() => {
    isTypingRef.current = true;

    // First keystroke → mark edited
    if (!hasMarkedEdited.current) {
      hasMarkedEdited.current = true;
      markSectionEdited(sessionId, sectionKey);
    }

    scheduleAutoSave();
  }, [markSectionEdited, scheduleAutoSave, sessionId, sectionKey]);

  // ── Focus / blur ──────────────────────────────────────────────────────────

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowTooltip(false);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    isTypingRef.current = false;

    // Immediate save on blur if pending
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      if (divRef.current) {
        const text = extractText(divRef.current);
        setDraftContent(sessionId, sectionKey, text, 'drafted');
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1800);
      }
    }
  }, [sessionId, sectionKey, setDraftContent]);

  return (
    <div className="relative">
      {/* Tooltip */}
      {showTooltip && !isFocused && (
        <div
          className="pointer-events-none absolute -top-8 left-0 z-10 rounded-md px-2.5 py-1 text-[11px] font-medium shadow-md transition-opacity duration-200"
          style={{
            background: 'rgba(26,37,53,0.92)',
            color: '#E8EDF5',
            border: '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap',
          }}
        >
          Click anywhere to edit
        </div>
      )}

      {/* Contenteditable */}
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        className="inline-editor-content"
        style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 15,
          fontWeight: 400,
          lineHeight: 1.9,
          color: 'var(--text-clinical)',
          padding: '12px 14px',
          borderRadius: 6,
          transition: 'all 150ms ease',
          background: isFocused ? 'var(--surface-edit-active)' : 'transparent',
          border: isFocused
            ? '1px dashed var(--border-edit-active)'
            : '1px solid transparent',
          boxShadow: isFocused ? 'var(--shadow-edit-focus)' : 'none',
          cursor: 'text',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        aria-label="Section draft content — click to edit"
        role="textbox"
        aria-multiline="true"
      />

      {/* Auto-save indicator */}
      {saveState !== 'idle' && (
        <div
          className="absolute bottom-2 right-3 text-[11px] transition-opacity duration-300"
          style={{
            color: saveState === 'saved' ? 'var(--status-complete)' : 'var(--text-tertiary)',
            opacity: 1,
          }}
        >
          {saveState === 'saving' ? 'saving…' : '✓ Saved'}
        </div>
      )}
    </div>
  );
};

export default InlineEditor;
