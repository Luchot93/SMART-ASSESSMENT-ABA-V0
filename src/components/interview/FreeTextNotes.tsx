import { useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { getSectionConfig } from '@/utils/sectionConfig';
import type { SectionKey } from '@/types';

interface FreeTextNotesProps {
  sessionId: string;
  sectionKey: SectionKey;
}

export const FreeTextNotes = ({ sessionId, sectionKey }: FreeTextNotesProps) => {
  const config = getSectionConfig(sectionKey);

  const storeNotes = useSessionStore(
    (s) =>
      s.sessions.find((sess) => sess.id === sessionId)?.sections[sectionKey]?.notes ?? '',
  );
  const transcript = useSessionStore(
    (s) =>
      s.sessions.find((sess) => sess.id === sessionId)?.sections[sectionKey]?.transcript ?? null,
  );
  const updateSectionNotes = useSessionStore((s) => s.updateSectionNotes);

  const [value, setValue] = useState(storeNotes);
  const [focused, setFocused] = useState(false);

  const { isSaving, lastSavedAt } = useAutoSave(
    value,
    (v) => updateSectionNotes(sessionId, sectionKey, v),
    800,
  );

  const saveLabel = isSaving ? 'saving…' : lastSavedAt ? '✓ Saved' : '';

  return (
    <div className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase"
          style={{ letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}
        >
          Free-Text Notes
        </span>
        <span
          className="text-[11px] transition-opacity duration-300"
          style={{
            color: !isSaving && lastSavedAt ? 'var(--status-complete)' : 'var(--text-tertiary)',
            opacity: saveLabel ? 1 : 0,
          }}
          aria-live="polite"
        >
          {saveLabel}
        </span>
      </div>

      {/* Recording pill — shown when a transcript has been captured */}
      {transcript !== null && (
        <span
          style={{
            fontSize: '11px',
            background: 'rgba(0,212,174,0.08)',
            border: '1px solid rgba(0,212,174,0.20)',
            color: 'var(--accent-teal)',
            borderRadius: '999px',
            padding: '1px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          🎙 Recording captured — AI will use both
        </span>
      )}

      {/* Textarea — full-width on all breakpoints */}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={config.freeTextPrompt || 'Add clinical notes…'}
        className="w-full resize-y rounded-lg px-3 py-3 text-[14px] outline-none"
        style={{
          minHeight: 96,
          fontFamily: "'Instrument Sans', sans-serif",
          lineHeight: 1.65,
          background: 'var(--surface-elevated)',
          color: 'var(--text-primary)',
          border: focused ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
          boxShadow: focused ? '0 0 0 3px var(--accent-teal-muted)' : 'none',
          borderRadius: 8,
          transition: 'border-color 150ms, box-shadow 150ms',
        }}
      />
    </div>
  );
};

export default FreeTextNotes;
