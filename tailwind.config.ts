import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "constructionStripes": "repeating-linear-gradient(55deg, #000000, #000000 15px,#fac800 15px,#fac800 30px)"
      },
      colors: {
        "primary-blue": "#224395",
      }
    },
  },
  plugins: [
    
  ],
};
export default config;
