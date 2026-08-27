/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      /* ── DESIGN SYSTEM — vedi styles/tokens.css ── */
      fontFamily: {
        head: ['var(--font-head)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        DEFAULT: 'var(--radius)',
        lg:   'var(--radius)',
        xl:   'var(--radius-lg)',
        '2xl': 'var(--radius-lg)',
      },
      boxShadow: {
        card: 'var(--fr-shadow-sm)',
        float: 'var(--fr-shadow)',
        glow: 'var(--fr-glow-red)',
      },
      maxWidth: {
        wrap: 'var(--maxw)',
      },
      colors: {
        /* Token semantici: usare questi nel codice nuovo */
        surface: {
          DEFAULT: 'var(--fr-surface)',
          2: 'var(--fr-surface-2)',
          3: 'var(--fr-surface-3)',
        },
        ground: 'var(--fr-bg)',
        ink: {
          DEFAULT: 'var(--fr-text)',
          muted: 'var(--fr-text-muted)',
          faint: 'var(--fr-text-faint)',
          dim: 'var(--fr-text-dim)',
        },
        hairline: {
          DEFAULT: 'var(--fr-border)',
          strong: 'var(--fr-border-strong)',
        },
        brand: {
          DEFAULT: 'var(--fr-red)',
          ink: 'var(--fr-red-ink)',
          soft: 'var(--fr-red-soft)',
        },
        gold: 'var(--fr-gold)',
        teal: 'var(--fr-teal)',

        // SCUDERIE F1 2026

        ferrari: {
          red: 'var(--fr-red)',
          yellow: 'var(--fr-gold)',
          black: 'var(--fr-surface)',
        },

        mclaren: {
          papaya: '#FF8700',
          blue: '#47C7FC',
          black: '#0B0B0B',
        },

        mercedes: {
          teal: '#00D2BE',
          silver: '#C0C0C0',
          black: '#0A0A0A',
        },

        redbull: {
          blue: '#0600EF',
          red: '#C8102E',
          yellow: '#FCD700',
          navy: '#0A0A2A',
        },

        aston: {
          green: '#006F62',
          lime: '#CEDC00',
          black: '#0B1F1C',
        },

        alpine: {
          blue: '#0090FF',
          pink: '#FF4FC3',
          dark: '#081A2C',
        },

        williams: {
          blue: '#005AFF',
          navy: '#041E42',
          white: '#FFFFFF',
        },

        haas: {
          red: '#B60000',
          gray: '#787878',
          black: '#111111',
        },

        racingbulls: {
          blue: '#1E3AFF',
          white: '#FFFFFF',
          red: '#E10600',
        },

        audi: {
          red: '#BB0A30',
          black: '#000000',
          gray: '#2B2B2B',
        },

        cadillac: {
          blue: '#002B5C',
          gold: '#C9A44C',
          red: '#9E1B32',
        },

        // RACING / TRACK UI

        racing: {
          asphalt: '#1C1C1C',
          carbon: '#0F0F0F',
          pitlane: '#2A2A2A',
          kerbRed: '#C8102E',
          kerbWhite: '#FFFFFF',
        },

        // FLAG & STATUS
        flag: {
          green: '#00E701',
          yellow: '#FFC300',
          red: '#E10600',
          blue: '#0090FF',
          black: '#111111',
        },

        status: {
          success: '#00E701',
          warning: '#FFC300',
          danger: '#E10600',
          info: '#0090FF',
          neutral: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
}
