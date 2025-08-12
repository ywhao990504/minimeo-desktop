export type Accent = "pink" | "rose" | "violet" | "emerald" | "orange"

export function accentClasses(accent: Accent) {
  // Light, cute palette (fonts/colors slightly lighter)
  switch (accent) {
    case "rose":
      return {
        boardBg: "from-rose-100 to-rose-50 dark:from-rose-900/35 dark:to-rose-900/15",
        paperBg: "from-white to-rose-50/60 dark:from-neutral-900 dark:to-rose-950/15",
        paperBorder: "border-rose-200/60 dark:border-rose-800/40",
        binderBg: "from-rose-300 to-pink-300",
        binderBorder: "border-rose-300/40",
        hole: "bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700",
        glow: "bg-rose-300/18 dark:bg-rose-500/10",
        cardBg: "from-rose-50 to-pink-50 dark:from-rose-900/24 dark:to-pink-900/16",
        cardBorder: "border-rose-200/50 dark:border-rose-700/35",
        text: "text-rose-500 dark:text-rose-300",
        icon: "text-rose-500 dark:text-rose-300",
        shine: "bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]",
      }
    case "violet":
      return {
        boardBg: "from-violet-100 to-violet-50 dark:from-violet-900/35 dark:to-violet-900/15",
        paperBg: "from-white to-violet-50/60 dark:from-neutral-900 dark:to-violet-950/15",
        paperBorder: "border-violet-200/60 dark:border-violet-800/40",
        binderBg: "from-violet-300 to-fuchsia-300",
        binderBorder: "border-violet-300/40",
        hole: "bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700",
        glow: "bg-violet-300/18 dark:bg-violet-500/10",
        cardBg: "from-violet-50 to-fuchsia-50 dark:from-violet-900/24 dark:to-fuchsia-900/16",
        cardBorder: "border-violet-200/50 dark:border-violet-700/35",
        text: "text-violet-500 dark:text-violet-300",
        icon: "text-violet-500 dark:text-violet-300",
        shine: "bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]",
      }
    case "emerald":
      return {
        boardBg: "from-emerald-100 to-teal-50/40 dark:from-emerald-900/60 dark:to-teal-900/30",
        paperBg: "from-white/85 to-emerald-50/50 dark:from-neutral-950/90 dark:to-emerald-950/35",
        paperBorder: "border-emerald-300/70 dark:border-emerald-800/60",
        binderBg: "from-emerald-400 to-teal-400",
        binderBorder: "border-emerald-400/60",
        hole: "bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700",
        glow: "bg-emerald-400/24 dark:bg-emerald-500/20",
        cardBg: "from-emerald-50/70 to-teal-50/50 dark:from-emerald-900/40 dark:to-teal-900/28",
        cardBorder: "border-emerald-300/60 dark:border-emerald-700/50",
        text: "text-emerald-600 dark:text-emerald-300",
        icon: "text-emerald-600 dark:text-emerald-300",
        shine: "bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]",
      }
    case "orange":
      return {
        boardBg: "from-orange-100 to-amber-50 dark:from-orange-900/35 dark:to-amber-900/15",
        paperBg: "from-white to-orange-50/60 dark:from-neutral-900 dark:to-orange-950/15",
        paperBorder: "border-orange-200/60 dark:border-amber-800/40",
        binderBg: "from-orange-300 to-amber-300",
        binderBorder: "border-orange-300/40",
        hole: "bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700",
        glow: "bg-orange-300/18 dark:bg-orange-500/10",
        cardBg: "from-orange-50 to-amber-50 dark:from-orange-900/24 dark:to-amber-900/16",
        cardBorder: "border-orange-200/50 dark:border-amber-700/35",
        text: "text-orange-500 dark:text-orange-300",
        icon: "text-orange-500 dark:text-orange-300",
        shine: "bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]",
      }
    default:
      return {
        boardBg: "from-pink-100 to-rose-50 dark:from-pink-900/35 dark:to-rose-900/15",
        paperBg: "from-white to-pink-50/60 dark:from-neutral-900 dark:to-pink-950/15",
        paperBorder: "border-pink-200/60 dark:border-rose-800/40",
        binderBg: "from-pink-300 to-rose-300",
        binderBorder: "border-pink-300/40",
        hole: "bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700",
        glow: "bg-pink-300/18 dark:bg-pink-500/10",
        cardBg: "from-pink-50 to-rose-50 dark:from-pink-900/24 dark:to-rose-900/16",
        cardBorder: "border-pink-200/50 dark:border-rose-700/35",
        text: "text-pink-500 dark:text-pink-300",
        icon: "text-pink-500 dark:text-pink-300",
        shine: "bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]",
      }
  }
}
