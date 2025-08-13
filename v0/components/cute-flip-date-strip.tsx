"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Baloo_2 } from 'next/font/google'
import { Sun, Cloud, CloudRain, Snowflake, Wind } from 'lucide-react'
import { accentClasses, type Accent } from "@/lib/cute-theme"

const cute = Baloo_2({ subsets: ["latin"], weight: ["600", "700"] })

type WeatherKind = "sun" | "cloud" | "rain" | "snow" | "wind"

export default function CuteFlipDateStrip({
  speedMs = 60,
  accent = "pink",
  className = "",
  size = "xl",
}: {
  speedMs?: number
  accent?: Accent
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const [nowTick, setNowTick] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const today = useMemo(() => new Date(nowTick), [nowTick])
  const targetDigits = useMemo(() => formatDigits(today), [today])
  const targetWeekIndex = useMemo(() => getWeekIndex(today), [today])

  const [displayDigits, setDisplayDigits] = useState<number[]>(() => targetDigits)
  const [displayWeekIndex, setDisplayWeekIndex] = useState<number>(() => targetWeekIndex)
  const [hovering, setHovering] = useState(false)

  // Weather: Beijing realtime target + display flipping
  const [actualWeather, setActualWeather] = useState<WeatherKind>("sun")
  const [displayWeather, setDisplayWeather] = useState<WeatherKind>("sun")

  // 保持最新的悬停状态，供定时器回调读取
  const hoveringRef = useRef(false)
  useEffect(() => {
    hoveringRef.current = hovering
  }, [hovering])

  // 天气：挂载即刻拉取，并每 30 分钟自动刷新一次
  useEffect(() => {
    let timerId: number | null = null

    const fetchWeather = async () => {
      const lat = 39.9042
      const lon = 116.4074
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
        )
        const json = await res.json()
        const cw = json?.current_weather
        if (!cw) return
        const kind = mapOpenMeteoToKind(Number(cw.weathercode), Number(cw.windspeed))
        setActualWeather(kind)
        if (!hoveringRef.current) setDisplayWeather(kind)
      } catch {
        // ignore network errors
      }
    }

    // 立即拉取一次
    fetchWeather()
    // 30 分钟刷新
    timerId = window.setInterval(fetchWeather, 30 * 60 * 1000)

    return () => {
      if (timerId) window.clearInterval(timerId)
    }
  }, [])

  // 取消手动点击切换天气，改为仅根据接口半小时刷新

  // 翻页动效的定时器（仅在悬停时运行），离开时一定清理，避免“停不下来”
  const digitTimerRef = useRef<number | null>(null)
  const weekTimerRef = useRef<number | null>(null)
  const weatherCycleRef = useRef<number | null>(null)

  useEffect(() => {
    // 悬停时开启动效
    if (hovering) {
      clearTimers()
      digitTimerRef.current = window.setInterval(() => {
        setDisplayDigits((prev) => prev.map((n) => (Math.random() > 0.4 ? (n + 1) % 10 : n)))
      }, Math.max(30, speedMs))

      weekTimerRef.current = window.setInterval(() => {
        setDisplayWeekIndex((prev) => (prev + 1) % 7)
      }, Math.max(200, speedMs * 3))

      weatherCycleRef.current = window.setInterval(() => {
        setDisplayWeather((w) => nextWeather(w))
      }, Math.max(260, speedMs * 3.5))

      return clearTimers
    }

    // 非悬停：对齐目标并确保清理
    clearTimers()
    setDisplayDigits(targetDigits)
    setDisplayWeekIndex(targetWeekIndex)
    setDisplayWeather(actualWeather)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovering, speedMs])

  // 窗口失焦、鼠标离开窗口或文档隐藏时，强制结束悬停态，防止动画“停不下来”
  useEffect(() => {
    const endHover = () => setHovering(false)
    const onPointerOut = (e: PointerEvent) => {
      if (e.relatedTarget === null) endHover()
    }
    window.addEventListener('blur', endHover)
    window.addEventListener('pointerleave', endHover)
    window.addEventListener('pointerout', onPointerOut)
    const onVis = () => { if (document.hidden) endHover() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('blur', endHover)
      window.removeEventListener('pointerleave', endHover)
      window.removeEventListener('pointerout', onPointerOut)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // 组件卸载时兜底清理所有计时器
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  // 时间/天气变化时，若未悬停则同步到目标值
  useEffect(() => {
    if (!hovering) {
      setDisplayDigits(targetDigits)
      setDisplayWeekIndex(targetWeekIndex)
      setDisplayWeather(actualWeather)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDigits, targetWeekIndex, actualWeather])

  useEffect(() => {
    if (!hovering) {
      setDisplayDigits(targetDigits)
      setDisplayWeekIndex(targetWeekIndex)
    }
  }, [targetDigits, targetWeekIndex, hovering])

  function clearTimers() {
    if (digitTimerRef.current) {
      window.clearInterval(digitTimerRef.current)
      digitTimerRef.current = null
    }
    if (weekTimerRef.current) {
      window.clearInterval(weekTimerRef.current)
      weekTimerRef.current = null
    }
    if (weatherCycleRef.current) {
      window.clearInterval(weatherCycleRef.current)
      weatherCycleRef.current = null
    }
  }

  const classes = useMemo(() => accentClasses(accent), [accent])
  const dims = sizeDims(size)
  const label = `${digitsToString(targetDigits)} ${WEEKS[targetWeekIndex]}`

  return (
    <div className={cn("flex w-full items-center justify-center", className)}>
      <CalendarBoard classes={classes} hovering={hovering}>
        <motion.div
          className="relative z-10 flex items-center gap-1.5 md:gap-2"
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onPointerCancel={() => setHovering(false)}
          animate={hovering ? { scale: 1 } : { scale: [1, 1.01, 1], y: [0, -1.5, 0] }}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: hovering ? 0 : Infinity }}
          aria-label={label}
          aria-live="polite"
        >
          {displayDigits.map((n, i) => (
            <FlipDigitCard
              key={`d-${i}`}
              value={n}
              target={targetDigits[i]}
              flipping={hovering}
              classes={classes}
              dims={dims}
            />
          ))}

          <div style={{ width: dims.space }} />

          <WeekCard
            index={displayWeekIndex}
            targetIndex={targetWeekIndex}
            flipping={hovering}
            classes={classes}
            dims={dims}
          />

          <div style={{ width: Math.round(dims.space * 0.8) }} />

          <WeatherCardInline
            kind={displayWeather}
            flipping={hovering}
            classes={classes}
            dims={dims}
          />
        </motion.div>
      </CalendarBoard>
    </div>
  )
}

/* Subcomponents */

function CalendarBoard({
  children,
  classes,
  hovering,
}: {
  children: React.ReactNode
  classes: ReturnType<typeof accentClasses>
  hovering: boolean
}) {
  return (
    <motion.div
      className={cn("relative w-fit rounded-[28px] p-4 md:p-6", "bg-gradient-to-b shadow-xl", classes.boardBg, "backdrop-blur-[2px]")}
      animate={hovering ? { rotate: [-0.4, 0.4, -0.4] } : { rotate: 0 }}
      transition={{ duration: hovering ? 2 : 0.4, repeat: hovering ? Infinity : 0, ease: "easeInOut" }}
    >
      <div
        className={cn(
          "relative rounded-3xl border p-4 md:p-6",
          "bg-gradient-to-b",
           classes.paperBg,
          classes.paperBorder,
          "shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
        )}
      >
        {/* Light binder bar */}
        <div
          className={cn(
            "absolute -top-4 left-1/2 h-7 w-48 -translate-x-1/2 rounded-full border",
            "bg-gradient-to-b",
            classes.binderBg,
            classes.binderBorder,
            "shadow-md"
          )}
        />
        <div className="pointer-events-none absolute -top-2 left-1/2 flex -translate-x-1/2 gap-16">
          {[0, 1].map((i) => (
            <div key={i} className={cn("h-4 w-4 rounded-full border shadow-inner", classes.hole)} />
          ))}
        </div>

        <motion.div
          aria-hidden
           className={cn("pointer-events-none absolute -inset-2 rounded-[30px] blur-2xl", classes.glow)}
           animate={hovering ? { opacity: 0.28 } : { opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: hovering ? 0.2 : 3, repeat: hovering ? 0 : Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  )
}

function FlipDigitCard({
  value,
  target,
  flipping,
  classes,
  dims,
}: {
  value: number
  target: number
  flipping: boolean
  classes: ReturnType<typeof accentClasses>
  dims: ReturnType<typeof sizeDims>
}) {
  const baseTilt = useRefNumber(-2, 2)
  const flipDur = useRefNumber(0.55, 0.85)

  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl border shadow-sm",
        "bg-gradient-to-br backdrop-blur",
        classes.cardBg,
        classes.cardBorder
      )}
      style={{ width: dims.w, height: dims.h }}
      whileHover={{ y: -2, rotate: baseTilt }}
      initial={false}
    >
      <motion.div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 rounded-2xl opacity-70", classes.shine)}
        animate={flipping ? { opacity: [0.15, 0.5, 0.15] } : { opacity: [0.08, 0.2, 0.08] }}
        transition={{ duration: flipping ? 0.9 * flipDur : 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className={cn("relative z-10 select-none tabular-nums", cute.className, classes.text)}
        style={{ fontSize: dims.font, transformOrigin: "50% 50%" }}
        animate={flipping ? { rotateX: [0, 180, 360] } : { rotateX: 0 }}
        transition={{ duration: flipDur, repeat: flipping ? Infinity : 0, ease: "easeInOut" }}
      >
        {flipping ? value : target}
      </motion.span>
    </motion.div>
  )
}

function WeekCard({
  index,
  targetIndex,
  flipping,
  classes,
  dims,
}: {
  index: number
  targetIndex: number
  flipping: boolean
  classes: ReturnType<typeof accentClasses>
  dims: ReturnType<typeof sizeDims>
}) {
  const baseTilt = useRefNumber(-2, 2)
  const flipDur = useRefNumber(0.7, 1.0)
  const label = WEEKS[index]
  const target = WEEKS[targetIndex]
  const w = Math.round(dims.w * 1.5)

  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl border shadow-sm",
        "bg-gradient-to-br backdrop-blur",
        classes.cardBg,
        classes.cardBorder
      )}
      style={{ width: w, height: dims.h }}
      whileHover={{ y: -2, rotate: baseTilt }}
      initial={false}
    >
      <motion.div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 rounded-2xl opacity-70", classes.shine)}
        animate={flipping ? { opacity: [0.15, 0.5, 0.15] } : { opacity: [0.08, 0.2, 0.08] }}
        transition={{ duration: flipping ? 1.2 * flipDur : 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className={cn("relative z-10 select-none uppercase tracking-tight", cute.className, classes.text)}
        style={{ fontSize: dims.font }}
        animate={flipping ? { rotateX: [0, 180, 360] } : { rotateX: 0 }}
        transition={{ duration: flipDur, repeat: flipping ? Infinity : 0, ease: "easeInOut" }}
      >
        {flipping ? label : target}
      </motion.span>
    </motion.div>
  )
}

function WeatherCardInline({
  kind,
  flipping,
  classes,
  dims,
}: {
  kind: WeatherKind
  flipping: boolean
  classes: ReturnType<typeof accentClasses>
  dims: ReturnType<typeof sizeDims>
}) {
  const baseTilt = useRefNumber(-2, 2)
  const flipDur = useRefNumber(0.7, 1.0)
  const Icon = kind === "sun" ? Sun : kind === "cloud" ? Cloud : kind === "rain" ? CloudRain : kind === "snow" ? Snowflake : Wind

  return (
    <motion.div
      aria-label="当前天气"
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl border shadow-sm",
        "bg-gradient-to-br backdrop-blur",
        classes.cardBg,
        classes.cardBorder
      )}
      style={{ width: dims.w, height: dims.h }}
      whileHover={{ y: -2, rotate: baseTilt }}
      initial={false}
    >
      <motion.div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 rounded-2xl opacity-70", classes.shine)}
        animate={flipping ? { opacity: [0.15, 0.5, 0.15] } : { opacity: [0.08, 0.2, 0.08] }}
        transition={{ duration: flipping ? 1.0 * flipDur : 2.0, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Key by flipping state to fully reset animation when leaving hover */}
      <motion.span
        key={flipping ? "flip" : "idle"}
        className="relative z-10"
        animate={flipping ? { rotateX: [0, 180, 360] } : { rotateX: 0 }}
        transition={{ duration: flipDur, repeat: flipping ? Infinity : 0, ease: "easeInOut" }}
      >
        <Icon className={cn("h-7 w-7 md:h-8 md:w-8", classes.icon)} />
      </motion.span>
    </motion.div>
  )
}

/* Helpers */

const WEEKS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatDigits(d: Date): number[] {
  const y = d.getFullYear().toString().padStart(4, "0")
  const m = (d.getMonth() + 1).toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")
  return `${y}${m}${day}`.split("").map((c) => parseInt(c, 10))
}

function digitsToString(digits: number[]) {
  return digits.join("")
}

function getWeekIndex(d: Date) {
  return d.getDay()
}

function useRefNumber(min: number, max: number) {
  const ref = useRef<number>(min + Math.random() * (max - min))
  return ref.current
}

type WeatherKindAll = WeatherKind
function nextWeather(w: WeatherKindAll): WeatherKindAll {
  const order: WeatherKindAll[] = ["sun", "cloud", "rain", "snow", "wind"]
  return order[(order.indexOf(w) + 1) % order.length]
}

function mapOpenMeteoToKind(code: number, windspeed: number): WeatherKind {
  if (windspeed >= 12) return "wind"
  if (code === 0) return "sun"
  if ([1, 2, 3, 45, 48].includes(code)) return "cloud"
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow"
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain"
  if ([95, 96, 99].includes(code)) return "wind"
  return "cloud"
}

function sizeDims(size: "sm" | "md" | "lg" | "xl") {
  switch (size) {
    case "sm":
      return { w: 40, h: 54, font: 26, space: 12 }
    case "md":
      return { w: 52, h: 70, font: 36, space: 14 }
    case "lg":
    default:
      return { w: 64, h: 86, font: 46, space: 18 }
    case "xl":
      return { w: 96, h: 130, font: 70, space: 26 }
  }
}
