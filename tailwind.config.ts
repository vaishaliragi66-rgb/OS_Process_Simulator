import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00E5FF',
        'neon-green': '#00FF88',
        'neon-amber': '#FFB800',
        'neon-blue': '#4488FF',
        'neon-red': '#FF4466',
        'space': '#050A14',
        'panel': 'rgba(0,229,255,0.05)',
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'monospace'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,229,255,0.5), 0 0 40px rgba(0,229,255,0.2)',
        'glow-green': '0 0 20px rgba(0,255,136,0.5), 0 0 40px rgba(0,255,136,0.2)',
        'glow-amber': '0 0 20px rgba(255,184,0,0.5)',
        'glow-red': '0 0 20px rgba(255,68,102,0.5)',
        'glow-blue': '0 0 20px rgba(68,136,255,0.5)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.4)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
