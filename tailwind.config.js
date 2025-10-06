// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'night-glass': 'rgba(15, 23, 42, 0.55)',
        'night-glass-strong': 'rgba(15, 23, 42, 0.6)',
        'night-glass-soft': 'rgba(15, 23, 42, 0.35)',
        'night-highlight': 'rgba(59, 130, 246, 0.08)',
        'night-border': 'rgba(148, 163, 184, 0.25)',
        'night-border-strong': 'rgba(148, 163, 184, 0.35)',
        'night-border-muted': 'rgba(148, 163, 184, 0.18)',
        'frost-base': '#e2e8f0',
        'frost-soft': 'rgba(226, 232, 240, 0.85)',
        'frost-muted': 'rgba(226, 232, 240, 0.7)',
        'frost-subtle': 'rgba(226, 232, 240, 0.45)',
        'charcoal-deep': '#0f172a',
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'primary-gradient': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
        'destructive-gradient': 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
      },
      keyframes: {
        slideInFromBottom: {
          from: { transform: "translateY(12px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromTop: {
          from: { transform: "translateY(-16px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        rowHighlight: {
          "0%": {
            backgroundColor: "rgba(59, 130, 246, 0.22)",
            boxShadow: "0 25px 60px -30px rgba(59, 130, 246, 0.55)",
          },
          "55%": {
            backgroundColor: "rgba(59, 130, 246, 0.14)",
            boxShadow: "0 18px 40px -28px rgba(59, 130, 246, 0.45)",
          },
          "100%": {
            backgroundColor: "transparent",
            boxShadow: "0 0 0 rgba(59, 130, 246, 0)",
          },
        },
        rowComplete: {
          "0%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
            backgroundColor: "transparent",
          },
          "55%": {
            opacity: "0.8",
            transform: "translateY(-4px) scale(0.995)",
            backgroundColor: "rgba(148, 163, 184, 0.14)",
            boxShadow: "0 18px 42px -26px rgba(148, 163, 184, 0.35)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-12px) scale(0.985)",
            backgroundColor: "transparent",
            boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
          },
        },
      },
      animation: {
        "slide-in-bottom": "slideInFromBottom 0.3s ease-out",
        "slide-in-top": "slideInFromTop 0.3s ease",
        "row-highlight": "rowHighlight 1.5s ease-out forwards",
        "row-complete": "rowComplete 0.5s ease forwards",
      },
      boxShadow: {
        "glass-xl": "0 45px 80px -40px rgba(15, 23, 42, 0.8)",
        "button-primary": "0 28px 50px -20px rgba(59, 130, 246, 0.55)",
        "button-primary-hover": "0 32px 60px -20px rgba(59, 130, 246, 0.6)",
        "button-secondary": "0 24px 50px -20px rgba(14, 165, 233, 0.45)",
        "button-secondary-hover": "0 28px 60px -20px rgba(14, 165, 233, 0.55)",
        "button-destructive": "0 24px 50px -20px rgba(239, 68, 68, 0.45)",
        "button-destructive-hover": "0 28px 60px -20px rgba(239, 68, 68, 0.55)",
        "card-hover": "0 45px 80px -40px rgba(59, 130, 246, 0.45)",
      },
    },
  },
  plugins: [],
}
