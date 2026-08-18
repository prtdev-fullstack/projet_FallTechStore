/** @type {import('tailwindcss').Config} */

/** Génère `rgb(var(--token) / <alpha-value>)` pour que bg-accent/20 fonctionne. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Sémantique : la seule chose que les composants doivent utiliser ── */
        canvas: token('canvas'),
        surface: token('surface'),
        elevated: token('elevated'),
        'elevated-hover': token('elevated-hover'),
        sunken: token('sunken'),

        border: token('border'),
        'border-subtle': token('border-subtle'),
        'border-strong': token('border-strong'),

        ink: {
          DEFAULT: token('text-primary'),
          secondary: token('text-secondary'),
          tertiary: token('text-tertiary'),
          inverse: token('text-inverse'),
        },

        accent: {
          DEFAULT: token('accent'),
          solid: token('accent-solid'),
          'solid-hover': token('accent-solid-hover'),
          text: token('accent-text'),
          fg: token('accent-fg'),
        },

        promo: {
          DEFAULT: token('promo'),
          fg: token('promo-fg'),
        },

        announce: {
          DEFAULT: token('announce'),
          fg: token('announce-fg'),
        },

        success: token('success'),
        warning: token('warning'),
        danger: token('danger'),

        /* Catégoriel data-viz (admin) — ordre fixe, voir tokens.css §5b */
        viz: {
          1: token('viz-1'),
          2: token('viz-2'),
          3: token('viz-3'),
          4: token('viz-4'),
        },

        /* ── Primitives : réservées au Design System et aux dégradés ── */
        carbon: {
          950: token('carbon-950'),
          900: token('carbon-900'),
          850: token('carbon-850'),
          800: token('carbon-800'),
          750: token('carbon-750'),
          700: token('carbon-700'),
          600: token('carbon-600'),
          500: token('carbon-500'),
          400: token('carbon-400'),
          300: token('carbon-300'),
          200: token('carbon-200'),
          100: token('carbon-100'),
          50: token('carbon-50'),
        },
        ion: {
          300: token('ion-300'),
          400: token('ion-400'),
          500: token('ion-500'),
          600: token('ion-600'),
          700: token('ion-700'),
        },
        amber: {
          400: token('amber-400'),
          500: token('amber-500'),
          600: token('amber-600'),
        },
        aurora: {
          violet: token('aurora-violet'),
          blue: token('aurora-blue'),
          cyan: token('aurora-cyan'),
          mint: token('aurora-mint'),
        },
      },

      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },

      /* Échelle typographique fluide : plus aucun breakpoint pour le texte. */
      fontSize: {
        'display-xl': ['clamp(3rem, 8vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-l': ['clamp(2.25rem, 5vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-m': ['clamp(1.875rem, 3.5vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '600' }],
        h2: ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.12', letterSpacing: '-0.02em', fontWeight: '600' }],
        h3: ['clamp(1.375rem, 2vw, 1.75rem)', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        h4: ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-l': ['1.125rem', { lineHeight: '1.65' }],
        body: ['1rem', { lineHeight: '1.65' }],
        'body-s': ['0.9375rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.5' }],
        overline: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.12em', fontWeight: '600' }],
      },

      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        /* Volontairement plafonné à 24px : au-delà, le premium devient enfantin. */
      },

      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
        glow: 'var(--shadow-glow)',
        'glow-promo': 'var(--shadow-glow-promo)',
      },

      backgroundImage: {
        aurora:
          'linear-gradient(115deg, rgb(var(--aurora-violet)) 0%, rgb(var(--aurora-blue)) 38%, rgb(var(--aurora-cyan)) 70%, rgb(var(--aurora-mint)) 100%)',
        'aurora-soft':
          'linear-gradient(115deg, rgb(var(--aurora-violet) / 0.18) 0%, rgb(var(--aurora-blue) / 0.18) 38%, rgb(var(--aurora-cyan) / 0.14) 70%, rgb(var(--aurora-mint) / 0.12) 100%)',
        'aurora-radial':
          'radial-gradient(60% 60% at 50% 40%, rgb(var(--aurora-blue) / 0.28) 0%, rgb(var(--aurora-violet) / 0.14) 45%, transparent 75%)',
        sheen:
          'linear-gradient(100deg, transparent 20%, rgb(var(--white) / 0.09) 50%, transparent 80%)',
      },

      transitionTimingFunction: {
        'out-expo': 'var(--ease-out-expo)',
        spring: 'var(--ease-spring)',
        smooth: 'var(--ease-in-out)',
      },

      transitionDuration: {
        instant: '120ms',
        fast: '200ms',
        base: '320ms',
        slow: '560ms',
        cinematic: '900ms',
      },

      maxWidth: {
        container: 'var(--container-max)',
      },

      spacing: {
        header: 'var(--header-height)',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(3%, -4%, 0) scale(1.08)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },

      animation: {
        'fade-up': 'fade-up var(--duration-slow) var(--ease-out-expo) both',
        'scale-in': 'scale-in var(--duration-base) var(--ease-out-expo) both',
        shimmer: 'shimmer 1.8s infinite',
        'aurora-drift': 'aurora-drift 18s var(--ease-in-out) infinite',
        marquee: 'marquee 38s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s var(--ease-out-expo) infinite',
      },
    },
  },
  plugins: [],
};
