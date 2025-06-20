import type { Config } from "tailwindcss";
const colors = require('tailwindcss/colors')

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        // primary: "#1A202C",
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(255, 255, 255, 0.72)',
      },
    },
  },
  plugins: [require("tailgrids/plugin")],
};
export default config;
