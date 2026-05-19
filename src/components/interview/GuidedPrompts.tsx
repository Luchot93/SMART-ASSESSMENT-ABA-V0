import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { getSectionConfig } from '@/utils/sectionConfig';
import type { SectionKey } from '@/types';
import { RecordButton } from './RecordButton';
import { TranscriptPanel } from './TranscriptPanel';

interface GuidedPromptsProps {
  sessionId: string;
  sectionKey: SectionKey;
}

const CPT_CODES = ['97151', '97153', '97155', '97156'] as const;

export const GuidedPrompts = ({ sessionId, sectionKey }: GuidedPromptsProps) => {
  const config = getSectionConfig(sectionKey);
  const session = useSessionStore(
    (s) => s.sessions.find((sess) => sess.id === sessionId) ?? null,
  );
  const section = session?.sections[sectionKey] ?? null;

  // Use first name only for a natural feel in the prompts
  const clientFirstName = session?.clientName.split(' ')[0] ?? 'the client';

  const fillPrompt = (text: string) =>
    text.replace(/\[client name\]/gi, clientFirstName);

  const [cptCounts, setCptCounts] = useState<Record<string, string>>({});
  const [showTranscript, setShowTranscript] = useState(
    () => section?.transcript !== null && section?.transcript !== undefined,
  );

  // Auto-show transcript when it first becomes available
  useEffect(() => {
    if (section?.recordingState === 'transcript_ready' && section?.transcript) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowTranscript(true);
    }
  }, [section?.recordingState, section?.transcript]);

  if (!section) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Label row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex-none text-[10px] font-semibold uppercase"
            style={{ letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}
          >
            Guided Prompts
          </span>
          {config.recordingValue > 0 && (
            <span
              className="flex-none text-[10px]"
              aria-label={`Recording value: ${config.recordingValue} stars`}
            >
              {'⭐'.repeat(config.recordingValue)}
            </span>
          )}
        </div>

        <RecordButton
          sessionId={sessionId}
          sectionKey={sectionKey}
          onTranscriptToggle={() => setShowTranscript((v) => !v)}
          isTranscriptVisible={showTranscript}
        />
      </div>

      {/* ── Transcript panel (toggled by RecordButton) ─────────── */}
      <TranscriptPanel
        sessionId={sessionId}
        sectionKey={sectionKey}
        transcript={section.transcript}
        isFlagged={section.transcriptFlagged}
        isVisible={showTranscript && section.transcript !== null}
      />

      {/* ── Quick-tap notice ─────────────────────────────────── */}
      {config.hasQuickTap && (
        <div
          className="rounded-md px-3 py-2 text-[12px]"
          style={{
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid var(--accent-teal-border)',
            color: 'var(--accent-teal)',
          }}
        >
          ⚡ Quick-tap active — tap indicators during observation
        </div>
      )}

      {/* ── Prompt groups ────────────────────────────────────── */}
      {config.guidedPrompts.length > 0 && (
        <div
          className="guided-prompts-scroll flex flex-col gap-4 overflow-y-auto pr-1"
          style={{ maxHeight: 320 }}
        >
          {config.guidedPrompts.map((group, gi) => {
            /* BCBA-only group: separator + CPT panel */
            if (group.isBcbaOnly) {
              return (
                <div key={gi} className="flex flex-col gap-2">
                  <div
                    className="flex items-center gap-2"
                    style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}
                  >
                    <span
                      className="flex-none text-[10px] font-semibold uppercase"
                      style={{ letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}
                    >
                      BCBA Clinical Notes
                    </span>
                  </div>

                  {/* CPT code sub-panel */}
                  <div
                    className="flex flex-col gap-3 rounded-lg px-4 py-3"
                    style={{
                      background: 'rgba(251,191,36,0.08)',
                      border: '1px solid rgba(251,191,36,0.25)',
                    }}
                  >
                    <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      {group.groupTitle}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {CPT_CODES.map((code) => (
                        <div key={code} className="flex flex-col gap-1">
                          <label
                            className="text-[11px] font-medium"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {code}
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0 units"
                            value={cptCounts[code] ?? ''}
                            onChange={(e) =>
                              setCptCounts((prev) => ({ ...prev, [code]: e.target.value }))
                            }
                            className="w-full rounded-md px-2 py-1.5 text-[13px] outline-none"
                            style={{
                              background: 'var(--surface-elevated)',
                              border: '1px solid var(--border-default)',
                              color: 'var(--text-primary)',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pl-1">
                    {group.prompts.map((prompt, pi) => (
                      <div key={pi} className="flex items-start gap-2">
                        <span
                          className="mt-[7px] inline-block flex-none rounded-full"
                          style={{ width: 3, height: 3, background: 'var(--accent-teal-muted)' }}
                        />
                        <p
                          className="text-[13px] leading-relaxed"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            /* Standard / personalized group */
            return (
              <div key={gi} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {group.isPersonalized && (
                    <span
                      className="flex-none rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: 'rgba(52,211,153,0.12)',
                        color: 'var(--accent-teal)',
                        border: '1px solid var(--accent-teal-border)',
                      }}
                    >
                      👤 Personalized
                    </span>
                  )}
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {group.groupTitle}
                  </span>
                </div>

                <div className="flex flex-col gap-2 pl-1">
                  {group.prompts.map((prompt, pi) => (
                    <div key={pi} className="flex items-start gap-2">
                      <span
                        className="mt-[7px] inline-block flex-none rounded-full"
                        style={{ width: 3, height: 3, background: 'var(--accent-teal-muted)' }}
                      />
                      <p
                        className="text-[13px] leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {fillPrompt(prompt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuidedPrompts;
