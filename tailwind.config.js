/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(18px,-22px) scale(1.03)" },
        },
        sweep: {
          "0%": { transform: "translateX(-70%)" },
          "50%": { transform: "translateX(120%)" },
          "100%": { transform: "translateX(-70%)" },
        },
        pulseDot: {
          "0%": { boxShadow: "0 0 0 0 rgba(34,211,238,.35)", opacity: "0.9" },
          "70%": { boxShadow: "0 0 0 14px rgba(34,211,238,0)", opacity: "1" },
          "100%": { boxShadow: "0 0 0 0 rgba(34,211,238,0)", opacity: "0.9" },
        },
        pop: {
          "0%": { opacity: "0", transform: "translateY(10px) scale(.99)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        spinSlow: { to: { transform: "rotate(360deg)" } },
        radar: { to: { transform: "rotate(360deg)" } },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        glow: {
          "0%,100%": { opacity: ".55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 10s ease-in-out infinite",
        floaty2: "floaty 13s ease-in-out infinite",
        floaty3: "floaty 15s ease-in-out infinite",
        sweep: "sweep 1.1s ease-in-out infinite",
        pulseDot: "pulseDot 1.1s ease-in-out infinite",
        pop: "pop .35s ease forwards",
        spinSlow: "spinSlow 3.2s linear infinite",
        radar: "radar 1.8s linear infinite",
        shake: "shake .35s ease-in-out",
        glow: "glow 1.2s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 26px 70px rgba(0,0,0,.45)",
      },
    },
  },
  plugins: [],
};
