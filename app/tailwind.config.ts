import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: '#0a0f0a',
        surface: '#111811',
        card: '#161e16',
        border: '#1f2d1f',
        green: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
}

export default config
