"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const JellyPlusButton = forwardRef<HTMLButtonElement, { onClick: () => void; className?: string }>(
  function JellyPlusButton({ onClick, className }, ref) {
    return (
      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden",
          "border backdrop-blur-md",
          "bg-pink-500/18 hover:bg-pink-500/28",
          "border-pink-300/40 hover:border-pink-300/60",
          "text-pink-600",
          className,
        )}
        whileHover={{ scale: 1.08, rotate: [-0.4, 0.4, -0.2, 0] }}
        whileTap={{ scale: 0.96 }}
        transition={{
          // scale 使用弹簧
          scale: { type: "spring", stiffness: 220, damping: 14 },
          // rotate 使用 tween 以支持多关键帧
          rotate: { type: "tween", ease: "easeInOut", duration: 0.24 },
        }}
        aria-label="Add"
        title="Add"
      >
        {/* shimmer */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{
            background:
              "linear-gradient(110deg, rgba(255,255,255,0.24), rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.24) 60%, rgba(255,255,255,0.06))",
            maskImage: "linear-gradient(#000, #000)",
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <Plus className="relative z-10 h-4 w-4" />
      </motion.button>
    )
  },
)

export default JellyPlusButton
