import { heroui } from "@heroui/react";

/******* Tailwind configuration for HeroUI integration *******/
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/**/*.js",
    "./node_modules/@heroui/**/*.mjs",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};
