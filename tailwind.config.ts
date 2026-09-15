import type { Config } from 'tailwindcss';

/**
 * One palette, two themes. Every colour is a CSS variable holding an "R G B"
 * triplet so Tailwind's alpha modifiers (bg-primary/10) keep working.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        'bg-soft': token('bg-soft'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        border: token('border'),
        'border-strong': token('border-strong'),
        fg: token('fg'),
        'fg-muted': token('fg-muted'),
        'fg-subtle': token('fg-subtle'),
        primary: token('primary'),
        'primary-fg': token('primary-fg'),
        'primary-soft': token('primary-soft'),
        accent: token('accent'),
        'accent-fg': token('accent-fg'),
        warn: token('warn'),
        'warn-soft': token('warn-soft'),
        danger: token('danger'),
        'danger-soft': token('danger-soft'),
        info: token('info'),
        'info-soft': token('info-soft'),
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        ar: ['var(--font-ar)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 34 55 / 0.04), 0 8px 24px -12px rgb(15 34 55 / 0.16)',
        pop: '0 8px 32px -8px rgb(15 34 55 / 0.28)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(.96)' }, to: { opacity: '1', transform: 'none' } },
        'slide-in': { from: { opacity: '0', transform: 'translateX(var(--slide-from, -12px))' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pulse-ring': { '0%': { transform: 'scale(.9)', opacity: '.7' }, '70%': { transform: 'scale(1.6)', opacity: '0' }, '100%': { opacity: '0' } },
        'bar-grow': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        'fade-up': 'fade-up .45s cubic-bezier(.2,.7,.2,1) both',
        'fade-in': 'fade-in .3s ease both',
        'scale-in': 'scale-in .28s cubic-bezier(.2,.7,.2,1) both',
        'slide-in': 'slide-in .4s cubic-bezier(.2,.7,.2,1) both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(.2,.7,.2,1) infinite',
        'bar-grow': 'bar-grow .8s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};
export default config;
