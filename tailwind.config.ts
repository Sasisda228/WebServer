import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      height: {
        "10": "2.5rem", // 40px
      },
      colors: {
        "custom-yellow": "#FED700",
      },
      fontFamily: {
        "russo-one": ["RUSOONE"],
        sans: ["var(--font-russo-one)", "sans-serif"], // Переопределяем стандартный sans
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("daisyui"),
  ],
};
export default config;
