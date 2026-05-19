import { useEffect, useCallback } from 'react';
import { SECTION_ORDER, type SectionKey } from '@/types';

// Interview sections in order (demographics excluded — navigated by position 1–9)
const INTERVIEW_SECTIONS = SECTION_ORDER.filter((k) => k !== 'demographics');

interface UseKeyboardOptions {
  /** Called when the user presses Alt+1–Alt+9 to jump to a section */
  onExpandSection: (key: SectionKey) => void;
  /** Called when the user presses Escape to collapse the active section */
  onCollapseActive: () => void;
  /** Set false to temporarily disable (e.g. when a modal/overlay is open) */
  enabled?: boolean;
}

export function useKeyboard({
  onExpandSection,
  onCollapseActive,
  enabled = true,
}: UseKeyboardOptions): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't hijack shortcuts while the user is typing in an input/textarea/editor
      const tag = (e.target as HTMLElement).tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (e.target as HTMLElement).isContentEditable;

      // Escape — collapse active section (allow even in editables for UX)
      if (e.key === 'Escape') {
        onCollapseActive();
        return;
      }

      // Alt+1–Alt+9 — expand section by index (skip if typing)
      if (isEditable) return;

      if (e.altKey && e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1; // 0-based
        const sectionKey = INTERVIEW_SECTIONS[idx];
        if (sectionKey) {
          e.preventDefault();
          onExpandSection(sectionKey);
        }
      }
    },
    [enabled, onExpandSection, onCollapseActive],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
