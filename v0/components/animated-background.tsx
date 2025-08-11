"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

export default function AnimatedBackground() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  const translateX = useTransform(smoothX, (v) => v * 0.02)
  const translateY = useTransform(smoothY, (v) => v * 0.02)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2)
      mouseY.set(e.clientY - window.innerHeight / 2)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [mouseX, mouseY])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft pink gradient background (no image) */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-950 dark:to-pink-900" />

      {/* Subtle layered gradient with slight parallax */}
      <motion.div
        style={{ x: translateX, y: translateY }}
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.45),transparent_55%)]",
        )}
      />

      {/* Gentle animated glows */}
      <motion.div
        initial={{ x: -60, y: -20, opacity: 0.2 }}
        animate={{ x: [-30, 30, -30], y: [10, -10, 10], opacity: [0.16, 0.24, 0.16] }}
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className={cn(
          "absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full",
          "bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.18),rgba(0,0,0,0))] blur-2xl",
        )}
      />
      <motion.div
        initial={{ x: 60, y: 20, opacity: 0.18 }}
        animate={{ x: [40, -40, 40], y: [-10, 10, -10], opacity: [0.14, 0.22, 0.14] }}
        transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className={cn(
          "absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full",
          "bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.12),rgba(0,0,0,0))] blur-2xl",
        )}
      />
    </div>
  )
}
