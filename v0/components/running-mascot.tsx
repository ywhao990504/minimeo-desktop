"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, animate } from "framer-motion"
import { cn } from "@/lib/utils"

type RunningMascotProps = {
  src?: string
  className?: string
  heightPx?: number
  topOffsetPx?: number
  bottomOffsetPx?: number
  durationSec?: number
  flipHorizontally?: boolean
}

export default function RunningMascot({
  src = "/run-cat.gif",
  className = "",
  heightPx = 64,
  topOffsetPx = 8,
  bottomOffsetPx,
  durationSec = 10,
  flipHorizontally = false,
}: RunningMascotProps) {
  const [vw, setVw] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0)
  const [mounted, setMounted] = useState(false)
  const x = useMotionValue(0)
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null)
  const pausedRef = useRef(false)
  const insideRef = useRef(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    setMounted(true)
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener("resize", onResize)
    setVw(window.innerWidth)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // 让小猫从屏幕外左侧跑到屏幕外右侧
  const startX = useMemo(() => -Math.round(heightPx * 1.4 * 3), [heightPx])
  const endX = useMemo(() => vw + Math.round(heightPx * 1.4 * 3), [vw, heightPx])

  useEffect(() => {
    if (!mounted) return
    // 初始化位置并启动循环
    x.set(startX)
    startLoop()
    // 监听全局指针移动，元素移动到指针下方也能触发悬停
    const onMove = (e: PointerEvent) => {
      const el = imgRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const padX = rect.width * 0.2 // 中间 60% 宽度
      const padY = rect.height * 0.2 // 中间 60% 高度
      const left = rect.left + padX
      const right = rect.right - padX
      const top = rect.top + padY
      const bottom = rect.bottom - padY
      const inside = e.clientX > left && e.clientX < right && e.clientY > top && e.clientY < bottom
      if (inside && !pausedRef.current) {
        pausedRef.current = true
        controlsRef.current?.stop()
      } else if (!inside && pausedRef.current) {
        pausedRef.current = false
        startLoop()
      }
      insideRef.current = inside
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      controlsRef.current?.stop()
      window.removeEventListener('pointermove', onMove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, startX, endX])

  function startLoop() {
    const totalDistance = endX - startX
    const currentX = x.get()
    const remaining = Math.max(0, endX - currentX)
    const baseDuration = Math.max(2, durationSec * 0.55)
    const duration = baseDuration * (remaining / totalDistance || 1)
    controlsRef.current = animate(x, endX, {
      duration,
      ease: "linear",
      onComplete: () => {
        if (pausedRef.current) return
        x.set(startX)
        startLoop()
      },
    })
  }

  function onMouseEnter() {
    if (pausedRef.current) return
    pausedRef.current = true
    controlsRef.current?.stop()
  }

  function onMouseLeave() {
    pausedRef.current = false
    // 立刻继续跑
    startLoop()
  }

  function isInHitZone(e: React.MouseEvent | React.PointerEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const padX = rect.width * 0.2
    const padY = rect.height * 0.2
    const left = rect.left + padX
    const right = rect.right - padX
    const top = rect.top + padY
    const bottom = rect.bottom - padY
    return e.clientX > left && e.clientX < right && e.clientY > top && e.clientY < bottom
  }

  if (!mounted) return null

  const style: React.CSSProperties = bottomOffsetPx !== undefined
    ? { bottom: bottomOffsetPx, height: heightPx * 3, width: "auto" }
    : { top: topOffsetPx, height: heightPx * 3, width: "auto" }

  // 将实际命中区域限制为图片可见范围的 70% 宽度，减小悬停触发范围（基于实际宽度计算）

  return (
    <motion.img
      ref={imgRef}
      src={src}
      alt="mascot"
      style={{ ...style, x }}
      className={cn("fixed left-0 z-50 select-none pointer-events-auto will-change-transform", className)}
      initial={{ x: startX, opacity: 1, scaleX: flipHorizontally ? -1 : 1 }}
      animate={{ scaleX: flipHorizontally ? -1 : 1 }}
      whileHover={{ scale: 1.05, rotate: -2 }}
      // 事件回调用于边界兜底，但主要以全局 pointermove 为准
      onMouseEnter={(e) => { if (isInHitZone(e)) onMouseEnter() }}
      onMouseLeave={onMouseLeave}
      onPointerEnter={(e) => { if (isInHitZone(e)) onMouseEnter() }}
      onPointerLeave={onMouseLeave}
    />
  )
}


