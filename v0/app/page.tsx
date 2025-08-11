import { Suspense } from "react"
import AnimatedBackground from "@/components/animated-background"
import KanbanBoard from "@/components/kanban-board"
import DiscoveriesCard from "@/components/discoveries-card"
import CuteFlipDateStrip from "@/components/cute-flip-date-strip"
import NoScrollbarStyles from "@/components/no-scrollbar-styles"
import DataSyncButton from "@/components/data-sync-button"
import RunningMascot from "@/components/running-mascot"

export default function Page() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden">
      <NoScrollbarStyles />
      <AnimatedBackground />
      {/* Top running mascot (place your file at v0/public/run-cat.gif) */}
      <RunningMascot src="/run-cat.gif" heightPx={80} topOffsetPx={4} durationSec={20} flipHorizontally />

      <div className="relative z-10 mx-auto w-full px-3 pt-10 pb-3 md:px-6 md:pt-16 md:pb-4 max-w-[1400px]">
        {/* Centered cute calendar header */}
        <header className="mb-4 md:mb-6">
          <div className="relative flex w-full justify-center items-center">
            {/* Left decoration image */}
            <img
              src="/computer-cat.gif"
              alt="computer cat"
              className="absolute left-4 md:left-8 hidden md:block h-28 w-auto object-contain select-none pointer-events-none"
            />
            <CuteFlipDateStrip accent="pink" size="lg" speedMs={60} />
            {/* Right decoration image */}
            <img
              src="/phone-cat.gif"
              alt="phone cat"
              className="absolute right-4 md:right-8 hidden md:block h-28 w-auto object-contain select-none pointer-events-none"
            />
          </div>
        </header>

        {/* Data sync status (moved to fixed corner inside component) */}
        <DataSyncButton />

        {/* Two-column responsive layout */}
        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8 xl:col-span-8">
            <Suspense fallback={<div className="h-[480px] animate-pulse rounded-3xl bg-muted/50" />}>
              <KanbanBoard />
            </Suspense>
          </div>
          <div className="lg:col-span-4 xl:col-span-4">
            <Suspense fallback={<div className="h-[480px] animate-pulse rounded-3xl bg-muted/50" />}>
              <DiscoveriesCard />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
