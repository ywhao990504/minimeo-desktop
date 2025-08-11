import { Baloo_2, ZCOOL_KuaiLe } from 'next/font/google'

// Digits/Latin for the calendar flip
export const cuteDigits = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700"],
})

// Cute Chinese-friendly display font for titles
export const cuteTitle = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"],
})
