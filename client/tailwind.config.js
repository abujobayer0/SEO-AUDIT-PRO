/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        shine: {
          "0%": { "background-position": "100%" },
          "100%": { "background-position": "-100%" },
        },
      },
      animation: {
        shine: "shine 5s linear infinite",
      },
      colors: {
        primary: {
          50: "#f0f7ff",
          100: "#e0eefe",
          200: "#b9ddfe",
          300: "#7cc3fd",
          400: "#36a6f9",
          500: "#0c8aed",
          600: "#006dcb",
          700: "#0057a5",
          800: "#004a8a",
          900: "#003e73",
          950: "#002952",
          DEFAULT: "#0c8aed",
          foreground: "#ffffff",
        },
        secondary: {
          50: "#eef9ff",
          100: "#ddf2ff",
          200: "#b3e7ff",
          300: "#75d6ff",
          400: "#2cc0fc",
          500: "#06a3ec",
          600: "#0083ca",
          700: "#0069a4",
          800: "#005a87",
          900: "#004c71",
          950: "#00304c",
          DEFAULT: "#06a3ec",
          foreground: "#ffffff",
        },
        accent: {
          50: "#edf8ff",
          100: "#d6edff",
          200: "#b5e0ff",
          300: "#83ceff",
          400: "#48b4ff",
          500: "#1e95ff",
          600: "#0077ff",
          700: "#0062e0",
          800: "#0052b6",
          900: "#00489a",
          950: "#002c5c",
          DEFAULT: "#0077ff",
          foreground: "#ffffff",
        },
        background: "#ffffff",
        foreground: "#172554",
        card: {
          DEFAULT: "#f8fafc",
          foreground: "#172554",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#172554",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#0c8aed",
        chart: {
          1: "#0c8aed",
          2: "#06a3ec",
          3: "#0077ff",
          4: "#0057a5",
          5: "#002952",
        },
        gradient: {
          start: "#0c8aed",
          middle: "#0077ff",
          end: "#002952",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".bg-gradient-blue": {
          "background-image": "linear-gradient(to right, #0c8aed, #0077ff, #002952)",
        },
        ".bg-gradient-blue-vertical": {
          "background-image": "linear-gradient(to bottom, #0c8aed, #0077ff, #002952)",
        },
        ".text-gradient-blue": {
          "background-image": "linear-gradient(to right, #0c8aed, #0077ff, #002952)",
          "background-clip": "text",
          color: "transparent",
        },
        ".shadow-blue": {
          "box-shadow": "0 4px 14px 0 rgba(12, 138, 237, 0.25)",
        },
        ".bg-cozy": {
          "background-color": "#f8fafc",
          "background-image": "radial-gradient(rgba(12, 138, 237, 0.1) 1px, transparent 1px)",
          "background-size": "20px 20px",
        },
        ".bg-cozy-subtle": {
          "background-color": "#ffffff",
          "background-image":
            "linear-gradient(rgba(12, 138, 237, 0.05) 1px, transparent 1px), linear-gradient(to right, rgba(12, 138, 237, 0.05) 1px, transparent 1px)",
          "background-size": "40px 40px",
        },
        ".bg-cozy-warm": {
          "background-color": "#f0f7ff",
          "background-image":
            "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230c8aed' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
