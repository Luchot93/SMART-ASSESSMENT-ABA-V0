import { Minus, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { getSectionConfig } from '@/utils/sectionConfig';
import type { SectionKey } from '@/types';

interface BehavioralIndicatorsProps {
  sessionId: string;
  sectionKey: SectionKey;
}

const LONG_PRESS_MS = 500;

export const BehavioralIndicators = ({ sessionId, sectionKey }: BehavioralIndicatorsProps) => {
  const config = getSectionConfig(sectionKey);

  const indicators = useSessionStore(
    (s) =>
      s.sessions.find((sess) => sess.id === sessionId)?.sections[sectionKey]?.indicators ?? [],
  );
  const updateIndicatorCount = useSessionStore((s) => s.updateIndicatorCount);
  const addCustomIndicator = useSessionStore((s) => s.addCustomIndicator);
  const removeCustomIndicator = useSessionStore((s) => s.removeCustomIndicator);
  const resetIndicator = useSessionStore((s) => s.resetIndicator);

  const [flashPlus, setFlashPlus] = useState<string | null>(null);
  const [flashTag, setFlashTag] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [addText, setAddText] = useState('');

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetIdRef = useRef<string | null>(null);
  const lastResetCountRef = useRef<number>(0);

  // Only render for quick-tap sections
  if (!config.hasQuickTap) return null;

  const countIndicators = indicators.filter((i) => i.unit !== 'tag');
  const tagIndicators = config.defaultIndicators.filter((d) => d.unit === 'tag');

  /* ── Long-press reset ─────────────────────────────────────── */
  const startLongPress = (id: string, count: number) => {
    longPressRef.current = setTimeout(() => {
      setPulsingId(id);
      setTimeout(() => {
        setPulsingId(null);
        lastResetIdRef.current = id;
        lastResetCountRef.current = count;
        resetIndicator(sessionId, sectionKey, id);
        if (toastRef.current) clearTimeout(toastRef.current);
        setToast('Reset to 0 — Undo');
        toastRef.current = setTimeout(() => {
          setToast(null);
          lastResetIdRef.current = null;
        }, 3000);
      }, 350);
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  const handleUndo = () => {
    if (lastResetIdRef.current !== null) {
      updateIndicatorCount(sessionId, sectionKey, lastResetIdRef.current, lastResetCountRef.current);
      lastResetIdRef.current = null;
      setToast(null);
      if (toastRef.current) clearTimeout(toastRef.current);
    }
  };

  /* ── Plus flash ───────────────────────────────────────────── */
  const handlePlus = (id: string) => {
    updateIndicatorCount(sessionId, sectionKey, id, 1);
    setFlashPlus(id);
    setTimeout(() => setFlashPlus(null), 200);
  };

  /* ── Tag flash ────────────────────────────────────────────── */
  const handleTagClick = (tagId: string) => {
    setFlashTag(tagId);
    setTimeout(() => setFlashTag(null), 200);
  };

  /* ── Add custom behavior ──────────────────────────────────── */
  const handleAdd = () => {
    const label = addText.trim();
    if (!label) return;
    addCustomIndicator(sessionId, sectionKey, label);
    setAddText('');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      <span
        className="text-[10px] font-semibold uppercase"
        style={{ letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}
      >
        ⚡ Behavioral Indicators
      </span>

      {/* Counter grid */}
      <div className="grid grid-cols-2 gap-2">
        {countIndicators.map((indicator) => {
          const isPulsing = pulsingId === indicator.id;
          return (
            <div
              key={indicator.id}
              className="relative flex items-center gap-1.5 rounded-lg px-2 py-2 transition-colors duration-200"
              onMouseEnter={() => setHoveredId(indicator.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: isPulsing ? 'rgba(239,68,68,0.12)' : 'var(--surface-elevated)',
                border: isPulsing
                  ? '1px solid rgba(239,68,68,0.35)'
                  : '1px solid var(--border-subtle)',
              }}
            >
              {/* Minus */}
              <button
                onClick={() => updateIndicatorCount(sessionId, sectionKey, indicator.id, -1)}
                className="flex flex-none items-center justify-center rounded-md"
                style={{
                  width: 36,
                  height: 36,
                  background: 'var(--surface-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
                aria-label={`Decrease ${indicator.label}`}
              >
                <Minus size={14} />
              </button>

              {/* Count + label (long-press zone) */}
              <div
                className="flex flex-1 select-none flex-col items-center"
                onMouseDown={() => startLongPress(indicator.id, indicator.count)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(indicator.id, indicator.count)}
                onTouchEnd={cancelLongPress}
                title="Hold to reset"
                style={{ cursor: 'default' }}
              >
                <span
                  className="tabular-nums text-[20px] font-bold"
                  style={{
                    lineHeight: 1,
                    color: isPulsing ? 'rgba(239,68,68,0.85)' : 'var(--text-primary)',
                    transition: 'color 200ms',
                  }}
                >
                  {indicator.count}
                </span>
                <span
                  className="mt-0.5 text-center text-[10px] leading-tight"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {indicator.label}
                </span>
              </div>

              {/* Plus */}
              <button
                onClick={() => handlePlus(indicator.id)}
                className="flex flex-none items-center justify-center rounded-md transition-colors duration-100"
                style={{
                  width: 36,
                  height: 36,
                  background:
                    flashPlus === indicator.id ? 'var(--accent-teal)' : 'var(--surface-card)',
                  color: flashPlus === indicator.id ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
                aria-label={`Increase ${indicator.label}`}
              >
                <Plus size={14} />
              </button>

              {/* Delete button for custom indicators */}
              {indicator.isCustom && hoveredId === indicator.id && (
                <button
                  onClick={() => removeCustomIndicator(sessionId, sectionKey, indicator.id)}
                  className="absolute -right-1.5 -top-1.5 flex items-center justify-center rounded-full"
                  style={{
                    width: 16,
                    height: 16,
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-tertiary)',
                  }}
                  aria-label={`Remove ${indicator.label}`}
                >
                  <X size={9} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add behavior input */}
      {config.allowsCustomIndicators && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={addText}
            onChange={(e) => setAddText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder="＋ Add behavior…"
            className="flex-1 rounded-lg px-3 py-2 text-[13px] outline-none"
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          {addText.trim() && (
            <button
              onClick={handleAdd}
              className="flex-none rounded-lg px-3 text-[12px] font-medium"
              style={{ height: 36, background: 'var(--accent-teal)', color: '#fff', border: 'none' }}
            >
              Add
            </button>
          )}
        </div>
      )}

      {/* Antecedent tags */}
      {tagIndicators.length > 0 && (
        <div className="flex flex-col gap-2">
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}
          >
            Antecedents
          </span>
          <div className="flex flex-wrap gap-2">
            {tagIndicators.map((tag) => {
              const isFlashing = flashTag === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.id)}
                  className="rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: isFlashing ? 'var(--accent-teal)' : 'var(--surface-elevated)',
                    color: isFlashing ? '#fff' : 'var(--text-secondary)',
                    border: isFlashing
                      ? '1px solid var(--accent-teal)'
                      : '1px solid var(--border-default)',
                  }}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="flex items-center justify-between rounded-lg px-4 py-2 text-[13px]"
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        >
          <span>{toast}</span>
          <button
            onClick={handleUndo}
            style={{
              color: 'var(--accent-teal)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
};

export default BehavioralIndicators;
