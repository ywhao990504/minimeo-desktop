import AnimatedBackground from "@/components/animated-background"
import CuteFlipDateStrip from "@/components/cute-flip-date-strip"
import RunningMascot from "@/components/running-mascot"
import ClickFireworks from "@/components/click-fireworks"

export default function Page() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <AnimatedBackground />
      {/* 放大三倍的奔跑小猫 */}
      <RunningMascot src="/run-cat.gif" heightPx={80} bottomOffsetPx={8} durationSec={20} flipHorizontally />

      {/* 点击礼花 */}
      <ClickFireworks />

      {/* 仅保留奔跑小猫 */}

      {/* 中央翻页日历（绿色系，放大，上移一点） */}
      <div className="relative z-20 flex items-center justify-center w-full h-[100dvh] px-4 -mt-8 md:-mt-12">
        <CuteFlipDateStrip accent="emerald" size="xl" speedMs={60} />
      </div>
    </main>
  )
}
