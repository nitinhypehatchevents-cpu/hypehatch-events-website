import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#FA9616",
        brandMuted: "#888581",
        ink: "#1A1A1E",
        paper: "#F7F7F7",
        white: "#FFFFFF",
      },
      maxWidth: {
        container: "1280px",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      spacing: {
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        20: "20px",
        24: "24px",
        32: "32px",
        40: "40px",
        48: "48px",
        60: "60px",
        80: "80px",
        100: "100px",
      },
    },
  },
  plugins: [],
};

export default config;

