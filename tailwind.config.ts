import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10131a",
        paper: "#f7f8fb",
        reef: "#009f9d",
        signal: "#f0b429",
        violet: "#6c5ce7"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(16, 19, 26, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
