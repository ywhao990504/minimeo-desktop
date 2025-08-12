"use client"

import { useEffect, useRef } from "react"

export default function ClickFireworks() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const handler = (e: MouseEvent) => {
      spawnFireworks(root, e.clientX, e.clientY)
    }
    window.addEventListener("click", handler)
    return () => window.removeEventListener("click", handler)
  }, [])

  return <div ref={ref} className="pointer-events-none fixed inset-0 z-30" />
}

function spawnFireworks(root: HTMLDivElement, x: number, y: number) {
  const colors = ["#34d399", "#10b981", "#6ee7b7", "#a7f3d0"]
  const count = 30
  const points = sampleCircle(count, 90)

  for (let i = 0; i < points.length; i++) {
    const el = document.createElement("span")
    const p = points[i]
    // 让整体爆炸为“猫头轮廓”分布，单个粒子仍为圆形礼花
    const jitter = 6 * (Math.random() - 0.5)
    const dx = p.x * 1.3 + jitter
    const dy = p.y * 1.3 + jitter
    const size = 6 + Math.random() * 6
    const color = colors[i % colors.length]

    el.style.position = "fixed"
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    el.style.width = `${size}px`
    el.style.height = `${size}px`
    el.style.borderRadius = "9999px"
    el.style.pointerEvents = "none"
    el.style.background = color
    el.style.boxShadow = `0 0 10px ${color}`
    el.style.transform = "translate(-50%, -50%)"
    el.style.opacity = "1"
    el.style.transition = "transform 820ms cubic-bezier(.2,.7,.2,1), opacity 820ms linear"

    root.appendChild(el)

    // force layout
    void el.offsetWidth
    el.style.transform = `translate(${dx - 50}px, ${dy - 50}px) scale(0.95)`
    el.style.opacity = "0"

    setTimeout(() => el.remove(), 840)
  }
}

// 圆形分布采样
function sampleCircle(n: number, r: number): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, i) => {
    const ang = (i / n) * Math.PI * 2
    return { x: Math.cos(ang) * r, y: Math.sin(ang) * r }
  })
}

