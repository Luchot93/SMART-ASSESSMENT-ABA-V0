type SwatchGroup = {
  label: string;
  tokens: { name: string; var: string; value: string }[];
};

const swatchGroups: SwatchGroup[] = [
  {
    label: 'Surfaces',
    tokens: [
      { name: 'surface-app',        var: '--surface-app',        value: '#0D1520' },
      { name: 'surface-card',       var: '--surface-card',       value: '#162032' },
      { name: 'surface-card-hover', var: '--surface-card-hover', value: '#1C2940' },
      { name: 'surface-elevated',   var: '--surface-elevated',   value: '#1E2E45' },
      { name: 'surface-document',   var: '--surface-document',   value: '#F5F2EC' },
      { name: 'surface-edit-active',var: '--surface-edit-active',value: '#FFFEF5' },
    ],
  },
  {
    label: 'Accent',
    tokens: [
      { name: 'accent-teal',        var: '--accent-teal',        value: '#00D4AE' },
      { name: 'accent-teal-muted',  var: '--accent-teal-muted',  value: 'rgba(0,212,174,0.10)' },
      { name: 'accent-teal-border', var: '--accent-teal-border', value: 'rgba(0,212,174,0.20)' },
    ],
  },
  {
    label: 'Status',
    tokens: [
      { name: 'status-complete',      var: '--status-complete',      value: '#34D399' },
      { name: 'status-complete-bg',   var: '--status-complete-bg',   value: 'rgba(52,211,153,0.07)' },
      { name: 'status-partial',       var: '--status-partial',       value: '#FBBF24' },
      { name: 'status-partial-bg',    var: '--status-partial-bg',    value: 'rgba(251,191,36,0.07)' },
      { name: 'status-missing',       var: '--status-missing',       value: '#F87171' },
      { name: 'status-missing-bg',    var: '--status-missing-bg',    value: 'rgba(248,113,113,0.07)' },
      { name: 'status-recording',     var: '--status-recording',     value: '#EF4444' },
      { name: 'status-recording-bg',  var: '--status-recording-bg',  value: 'rgba(239,68,68,0.10)' },
      { name: 'status-edited',        var: '--status-edited',        value: '#818CF8' },
      { name: 'status-edited-bg',     var: '--status-edited-bg',     value: 'rgba(129,140,248,0.07)' },
    ],
  },
  {
    label: 'Text',
    tokens: [
      { name: 'text-primary',        var: '--text-primary',        value: '#E8EDF5' },
      { name: 'text-secondary',      var: '--text-secondary',      value: '#8899AA' },
      { name: 'text-tertiary',       var: '--text-tertiary',       value: '#556677' },
      { name: 'text-clinical',       var: '--text-clinical',       value: '#1A2535' },
      { name: 'text-clinical-muted', var: '--text-clinical-muted', value: '#4A5568' },
    ],
  },
  {
    label: 'Borders',
    tokens: [
      { name: 'border-subtle',      var: '--border-subtle',      value: 'rgba(255,255,255,0.05)' },
      { name: 'border-default',     var: '--border-default',     value: 'rgba(255,255,255,0.10)' },
      { name: 'border-focus',       var: '--border-focus',       value: 'rgba(0,212,174,0.50)' },
      { name: 'border-edit-active', var: '--border-edit-active', value: 'rgba(0,0,0,0.12)' },
      { name: 'border-complete',    var: '--border-complete',    value: 'rgba(52,211,153,0.40)' },
      { name: 'border-partial',     var: '--border-partial',     value: 'rgba(251,191,36,0.40)' },
      { name: 'border-missing',     var: '--border-missing',     value: 'rgba(248,113,113,0.40)' },
      { name: 'border-active',      var: '--border-active',      value: '#00D4AE' },
    ],
  },
];

const instrumentSizeScale = [
  { label: '12 / Regular', size: '12px', weight: '400' },
  { label: '12 / Medium',  size: '12px', weight: '500' },
  { label: '13 / Regular', size: '13px', weight: '400' },
  { label: '13 / Medium',  size: '13px', weight: '500' },
  { label: '14 / Regular', size: '14px', weight: '400' },
  { label: '14 / Medium',  size: '14px', weight: '500' },
  { label: '14 / SemiBold',size: '14px', weight: '600' },
  { label: '16 / Regular', size: '16px', weight: '400' },
  { label: '16 / SemiBold',size: '16px', weight: '600' },
  { label: '20 / SemiBold',size: '20px', weight: '600' },
  { label: '24 / Bold',    size: '24px', weight: '700' },
];

const Swatch = ({ token }: { token: SwatchGroup['tokens'][number] }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-card px-3 py-2.5">
    <div
      className="h-8 w-8 flex-none rounded border border-border-subtle"
      style={{ background: `var(${token.var})` }}
    />
    <div className="min-w-0 flex-1">
      <p className="truncate font-mono text-[11px] font-medium text-text-primary">
        {token.var}
      </p>
      <p className="truncate font-mono text-[10px] text-text-tertiary">
        {token.value}
      </p>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="mb-4 border-b border-border-default pb-2 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
      {title}
    </h2>
    {children}
  </section>
);

const DesignTokens = () => (
  <div className="min-h-screen bg-surface-app px-8 py-10">
    <div className="mx-auto max-w-5xl">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-text-primary">Design Tokens</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Shared styling contract between Smart Assessment and the ABA CRM.
        </p>
      </div>

      {/* ── Color Swatches ── */}
      {swatchGroups.map((group) => (
        <Section key={group.label} title={group.label}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {group.tokens.map((token) => (
              <Swatch key={token.name} token={token} />
            ))}
          </div>
        </Section>
      ))}

      {/* ── Shadows ── */}
      <Section title="Shadows">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: '--shadow-card',       shadow: 'var(--shadow-card)' },
            { label: '--shadow-elevated',   shadow: 'var(--shadow-elevated)' },
            { label: '--shadow-modal',      shadow: 'var(--shadow-modal)' },
            { label: '--shadow-edit-focus', shadow: 'var(--shadow-edit-focus)' },
          ].map(({ label, shadow }) => (
            <div
              key={label}
              className="rounded-lg border border-border-default bg-surface-card p-4"
              style={{ boxShadow: shadow }}
            >
              <p className="font-mono text-[10px] text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Instrument Sans Scale ── */}
      <Section title="Instrument Sans — Type Scale">
        <div className="rounded-lg border border-border-default bg-surface-card divide-y divide-border-subtle">
          {instrumentSizeScale.map(({ label, size, weight }) => (
            <div key={label} className="flex items-baseline gap-4 px-5 py-3">
              <span className="w-32 flex-none font-mono text-[10px] text-text-tertiary">
                {label}
              </span>
              <span
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: size,
                  fontWeight: weight,
                  color: 'var(--text-primary)',
                }}
              >
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Lora ── */}
      <Section title="Lora — Heading & Body">
        <div className="rounded-lg border border-border-default bg-surface-card divide-y divide-border-subtle">
          {[
            { label: '24 / Regular', size: '24px', weight: '400',
              text: 'Assessment Summary — Session Complete' },
            { label: '20 / Regular', size: '20px', weight: '400',
              text: 'Behavioral Intervention Progress Report' },
            { label: '16 / Regular', size: '16px', weight: '400',
              text: 'The client demonstrated consistent improvement across all tracked indicators during the observation period.' },
            { label: '16 / SemiBold', size: '16px', weight: '600',
              text: 'Key findings require immediate clinical review.' },
            { label: '14 / Regular', size: '14px', weight: '400',
              text: 'Section notes are preserved between sessions and can be edited at any time by the supervising BCBA.' },
          ].map(({ label, size, weight, text }) => (
            <div key={label} className="flex items-start gap-4 px-5 py-4">
              <span className="w-32 flex-none pt-1 font-mono text-[10px] text-text-tertiary">
                {label}
              </span>
              <span
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: size,
                  fontWeight: weight,
                  color: 'var(--text-primary)',
                  lineHeight: '1.5',
                }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Side-by-side at 15px ── */}
      <Section title="Instrument Sans vs Lora — 15px / Regular">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-default bg-surface-card p-5">
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent-teal">
              Instrument Sans
            </p>
            <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: '15px', fontWeight: '400', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              The client demonstrated targeted skill acquisition across communication and social domains. Data collection was consistent throughout the session.
            </p>
            <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: '15px', fontWeight: '500', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '12px' }}>
              Prompt levels reduced from full physical to gestural on 3 of 5 targets. No problem behaviors were observed during the session period.
            </p>
          </div>
          <div className="rounded-lg border border-border-default bg-surface-card p-5">
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent-teal">
              Lora
            </p>
            <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '15px', fontWeight: '400', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              The client demonstrated targeted skill acquisition across communication and social domains. Data collection was consistent throughout the session.
            </p>
            <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '12px' }}>
              Prompt levels reduced from full physical to gestural on 3 of 5 targets. No problem behaviors were observed during the session period.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-text-tertiary">
          Instrument Sans reads as clean UI copy; Lora reads as authored clinical prose. Use Instrument Sans for labels, navigation, and data — Lora for generated document text and session summaries.
        </p>
      </Section>

    </div>
  </div>
);

export default DesignTokens;
