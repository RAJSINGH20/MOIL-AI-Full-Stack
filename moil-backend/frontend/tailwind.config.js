/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        sidebar: "16px 0 38px rgba(2, 44, 34, 0.2)",
        "motion-card":
          "0 18px 42px rgba(15, 23, 42, 0.12), 0 5px 0 rgba(5, 150, 105, 0.08)",
        "map-frame":
          "0 0 0 5px rgba(16, 185, 129, 0.08), 0 12px 28px rgba(15, 23, 42, 0.12)",
        "map-frame-hover":
          "0 0 0 7px rgba(16, 185, 129, 0.12), 0 18px 34px rgba(15, 23, 42, 0.16)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(15, 118, 110, 0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 118, 110, 0.13) 1px, transparent 1px)",
      },
      keyframes: {
        "grid-drift": {
          from: { backgroundPosition: "0 0, 0 0" },
          to: { backgroundPosition: "42px 42px, 42px 42px" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "grid-drift": "grid-drift 24s linear infinite",
        "rise-in": "rise-in 700ms cubic-bezier(.2, .8, .2, 1) both",
      },
    },
  },
  plugins: [],
};
