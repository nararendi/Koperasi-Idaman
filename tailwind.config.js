/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563eb', // Antigravity Commit Blue
          'blue-dark': '#1d4ed8',
          'blue-deep': '#1e40af',
          'blue-light': '#eff6ff',
          'blue-subtle': '#f0f7ff',
          canvas: '#eaf2fc',
          yellow: '#ffd159',
          'yellow-hover': '#f7be38',
          'yellow-light': '#fef8e7',
          navy: '#0f172a',
          'navy-muted': '#475569',
          slate: '#64748b',
          card: '#ffffff'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
};
