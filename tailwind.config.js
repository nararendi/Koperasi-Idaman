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
          teal: '#139a8c',
          'teal-dark': '#0d8074',
          'teal-deep': '#095e55',
          'teal-light': '#e0f7f4',
          'teal-subtle': '#f0faf8',
          mint: '#e6f4f1',
          yellow: '#ffd159',
          'yellow-hover': '#f7be38',
          'yellow-light': '#fef8e7',
          navy: '#14293d',
          'navy-muted': '#627d98',
          slate: '#8295a8',
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
