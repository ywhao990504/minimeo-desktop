"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { motion } from "framer-motion"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import JellyPlusButton from "@/components/jelly-plus-button"
import { getLocal, setLocal, safeParse } from "@/lib/storage"
import { accentClasses } from "@/lib/cute-theme"
import { cn, generateId } from "@/lib/utils"
import { cuteDigits } from "@/lib/cute-fonts"

const theme = accentClasses("pink")

 type Discovery = { text: string; date: string }
const STORAGE_KEY = "workboard-discoveries-v1"

export default function DiscoveriesCard({ className = "" }: { className?: string }) {
  // 为避免 SSR/CSR 初始值不一致导致 hydration 报错，初始为空，挂载后再读取
  const [items, setItems] = useState<Discovery[]>([])
  const [text, setText] = useState("")
  const [parent] = useAutoAnimate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null)

  // Delete confirm modal (centered within the card)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    setLocal(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // 挂载后读取本地存储，标准化为 {text, date}
  useEffect(() => {
    const raw = safeParse<any[]>(getLocal(STORAGE_KEY), []) || []
    const normalized: Discovery[] = raw.map((r) => ({
      text: r?.text ?? String(r),
      date: r?.date ?? new Date().toISOString().slice(0, 10),
    }))
    setItems(normalized)
  }, [])

  // 稳定的组合 ref，避免每次 render 产生新回调导致 auto-animate 反复初始化
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      // @ts-ignore parent 是回调 ref
      parent(node)
      listRef.current = node
    },
    [parent],
  )

  function addItem() {
    if (!text.trim()) return

    // No confetti for adding discovery
    const today = new Date().toISOString().slice(0, 10)
    setItems((prev) => [{ text: text.trim(), date: today }, ...prev])
    setText("")
    setLastAddedIndex(0)
    inputRef.current?.focus()
    // 新增后将列表滚动到顶部，避免用户当前滚动位置导致“看不见”
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    })
    setTimeout(() => setLastAddedIndex(null), 900)
  }

  return (
    <Card
      className={cn(
        "relative h-[var(--card-h)] overflow-hidden rounded-3xl border shadow-xl",
        "bg-gradient-to-b",
        theme.paperBg,
        theme.paperBorder,
        className,
      )}
      // 预留底部 64px，避免与右下角浮窗重叠
      style={{ ['--card-h' as any]: 'clamp(520px, calc(70vh - 64px), 900px)' }}
    >
      <CardHeader className={cn("h-9 px-4 flex items-center border-b", theme.paperBorder)}>
        <CardTitle
          className={cn(
            "flex items-center gap-2 text-base md:text-lg font-semibold tracking-tight",
            cuteDigits.className,
            theme.text,
          )}
        >
          DISCOVERIES ✨
        </CardTitle>
      </CardHeader>

      <CardContent className="relative flex h-[calc(var(--card-h)-36px)] flex-col px-3 pt-1 pb-3">
        <div className="mb-2.5 flex items-center gap-2 relative z-20">
          <Input
            ref={inputRef}
            placeholder="Write a new discovery today..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            className="h-9"
          />
          <JellyPlusButton onClick={addItem} />
        </div>

        <div ref={setContainerRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-16 pr-1">
          {items.length === 0 ? (
            <div className={cn("flex h-full items-center justify-center text-base", theme.text)}>
              {"Add your first discovery!"}
            </div>
          ) : (
            <div className="grid gap-2">
              {items.map((it, idx) => (
                <DiscoveryItem
               key={`${it.date}-${it.text}-${generateId()}`}
                  item={it}
                  isLastAdded={lastAddedIndex === idx}
                  onRequestDelete={() => setConfirmId(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {confirmId !== null && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-[260px] rounded-xl border bg-white p-4 shadow-xl dark:bg-neutral-900">
              <div className="mb-3 text-center text-sm">Are you sure you want to delete this?</div>
              <div className="flex justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setConfirmId(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setItems((prev) => prev.filter((_, i) => i !== confirmId))
                    setConfirmId(null)
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* Item: height-only animation (no FLIP) and no white fade on line 2 */
function DiscoveryItem({
  item,
  isLastAdded,
  onRequestDelete,
}: {
  item: Discovery
  isLastAdded: boolean
  onRequestDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const pRef = useRef<HTMLParagraphElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const [fullH, setFullH] = useState(0)
  const [collapsedH, setCollapsedH] = useState(0)

  const measure = () => {
    const el = pRef.current
    if (!el) return
    const cs = window.getComputedStyle(el)
    const lh = Number.parseFloat(cs.lineHeight) || 20
    const pb = Number.parseFloat(cs.paddingBottom || "0") || 0
    setFullH(el.scrollHeight)
    setCollapsedH(Math.ceil(lh * 2 + pb))
    setIsTruncated(el.scrollHeight - Math.ceil(lh * 2 + pb) > 2)
  }

  useLayoutEffect(() => {
    measure()
    const onResize = () => measure()
    window.addEventListener("resize", onResize)
    const t = setTimeout(measure, 300) // font settle
    return () => {
      window.removeEventListener("resize", onResize)
      clearTimeout(t)
    }
  }, [item.text])

  const target = expanded ? fullH : collapsedH
  const hasTarget = target > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: isLastAdded ? [0.98, 1.02, 1] : 1 }}
      transition={{ duration: 0.24 }}
      className={cn(
        "group relative rounded-xl border p-3",
        "bg-gradient-to-br backdrop-blur",
        accentClasses("pink").cardBg,
        accentClasses("pink").cardBorder,
      )}
    >
      {isLastAdded && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,182,193,0.35), rgba(255,182,193,0) 60%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      )}

      <motion.div
        className="relative z-10 overflow-hidden"
        style={{ height: hasTarget ? target : "auto" }}
        animate={{ height: hasTarget ? target : "auto" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <p ref={pRef} className="text-sm break-words pr-10 pb-6 antialiased">
          {item.text}
        </p>
      </motion.div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-20 h-7 w-7"
        aria-label="Delete"
        title="Delete"
        onClick={onRequestDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {(isTruncated || expanded) && (
        <button
          type="button"
          className="absolute bottom-2 right-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-md text-pink-600 hover:text-pink-700"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse" : "Expand"}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
    </motion.div>
  )
}
