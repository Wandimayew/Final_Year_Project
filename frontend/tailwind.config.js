import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        text: "#1c1c1c",
        primary: "#3b82f6",
        secondary: "#6b7280",
        surface: "#f3f4f6",
      },
    },
  },
  darkMode: "class",
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("night", ".night &");
    }),
  ],
};
