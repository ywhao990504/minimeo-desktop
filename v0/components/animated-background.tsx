"use client"

// 壁纸背景：全屏自适应 wall.jpg
export default function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src="/wall.jpg"
        alt="wallpaper"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* 轻微绿色滤镜，统一与日历绿色系的色调，同时略微压暗提升对比 */}
      <div className="absolute inset-0 bg-emerald-950/24" />
    </div>
  )
}
