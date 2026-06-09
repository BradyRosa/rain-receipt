import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        receipt: "0 18px 60px rgba(15, 23, 42, 0.14)",
        rain: "inset 0 1px 0 rgba(255,255,255,0.72), 0 20px 70px rgba(30, 64, 175, 0.15)"
      },
      colors: {
        base: "#0052ff",
        ink: "#173153",
        slateReceipt: "#5a6678",
        umbrella: "#f5c542"
      }
    }
  },
  plugins: []
};

export default config;
