import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sora: ["var(--font-sora)", "sans-serif"],
                devanagari: ["var(--font-devanagari)", "sans-serif"],
            },
            colors: {
                saffron: "#ff6b2b",
                marigold: "#ffb830",
                emerald: "#00c48c",
                indigo: "#4361ee",
            },
        },
    },
    plugins: [],
};
export default config;
