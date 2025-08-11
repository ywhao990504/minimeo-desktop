"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type RunningMascotProps = {
  src?: string
  className?: string
  heightPx?: number
  topOffsetPx?: number
  durationSec?: number
  flipHorizontally?: boolean
}

export default function RunningMascot({
  src = "/run-cat.gif",
  className = "",
  heightPx = 64,
  topOffsetPx = 8,
  durationSec = 10,
  flipHorizontally = false,
}: RunningMascotProps) {
  const [vw, setVw] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener("resize", onResize)
    setVw(window.innerWidth)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // 让小猫从屏幕外左侧跑到屏幕外右侧
  const startX = useMemo(() => -Math.round(heightPx * 1.4), [heightPx])
  const endX = useMemo(() => vw + Math.round(heightPx * 1.4), [vw, heightPx])

  if (!mounted) return null

  return (
    <motion.img
      src={src}
      alt="mascot"
      style={{ top: topOffsetPx, height: heightPx, width: "auto" }}
      className={cn("fixed left-0 z-0 select-none pointer-events-none will-change-transform", className)}
      initial={{ x: startX, opacity: 1, scaleX: flipHorizontally ? -1 : 1 }}
      animate={{ x: endX, scaleX: flipHorizontally ? -1 : 1 }}
      transition={{ duration: durationSec, ease: "linear", repeat: Infinity }}
    />
  )
}


