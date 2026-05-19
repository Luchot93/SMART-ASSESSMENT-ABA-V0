import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        /* Surfaces */
        'surface-app': 'var(--surface-app)',
        'surface-card': 'var(--surface-card)',
        'surface-card-hover': 'var(--surface-card-hover)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-document': 'var(--surface-document)',
        'surface-edit-active': 'var(--surface-edit-active)',

        /* Accent */
        'accent-teal': 'var(--accent-teal)',
        'accent-teal-muted': 'var(--accent-teal-muted)',
        'accent-teal-border': 'var(--accent-teal-border)',

        /* Status */
        'status-complete': 'var(--status-complete)',
        'status-complete-bg': 'var(--status-complete-bg)',
        'status-partial': 'var(--status-partial)',
        'status-partial-bg': 'var(--status-partial-bg)',
        'status-missing': 'var(--status-missing)',
        'status-missing-bg': 'var(--status-missing-bg)',
        'status-recording': 'var(--status-recording)',
        'status-recording-bg': 'var(--status-recording-bg)',
        'status-edited': 'var(--status-edited)',
        'status-edited-bg': 'var(--status-edited-bg)',

        /* Text */
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-clinical': 'var(--text-clinical)',
        'text-clinical-muted': 'var(--text-clinical-muted)',

        /* Borders */
        'border-subtle': 'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-focus': 'var(--border-focus)',
        'border-edit-active': 'var(--border-edit-active)',
        'border-complete': 'var(--border-complete)',
        'border-partial': 'var(--border-partial)',
        'border-missing': 'var(--border-missing)',
        'border-active': 'var(--border-active)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        modal: 'var(--shadow-modal)',
        'edit-focus': 'var(--shadow-edit-focus)',
      },
    },
  },
  plugins: [],
};

export default config;
