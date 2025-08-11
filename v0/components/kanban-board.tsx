"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import JellyPlusButton from "@/components/jelly-plus-button"
import { getLocal, setLocal, safeParse } from "@/lib/storage"
import { accentClasses } from "@/lib/cute-theme"
import { cn, generateId } from "@/lib/utils"
import { cuteDigits } from "@/lib/cute-fonts"
import confetti from "canvas-confetti"

const theme = accentClasses("pink")

type Task = { id: string; text: string; done?: boolean; date?: string }
const STORAGE_KEY_V2 = "workboard-simple-tasks-v2"
const LEGACY_KANBAN_KEY = "workboard-tasks-v1" // migrate from old columns

export default function TaskBoard({ className = "" }: { className?: string }) {
  // 为避免 SSR 与 CSR 初始数据不一致导致的 hydration 报错，初始为空，挂载后再读取 localStorage
  const [tasks, setTasks] = useState<Task[]>([])
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const plusBtnRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // in-card confirm for delete
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setLocal(STORAGE_KEY_V2, JSON.stringify(tasks))
  }, [tasks])

  // 首次挂载后，从 localStorage 读取初始任务（安全解析）
  useEffect(() => {
    try {
      const initial = loadInitialTasks()
      setTasks(initial)
    } catch {
      // ignore
    }
  }, [])

  function addTask() {
    if (!text.trim()) return
    const today = new Date().toISOString().slice(0, 10)
    setTasks((prev) => [{ id: generateId(), text: text.trim(), done: false, date: today }, ...prev])
    setText("")
    inputRef.current?.focus()
    // 新增后将列表滚动到顶部，避免用户当前滚动位置导致“看不见”
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  function toggleDone(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
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
          TASK ✨
        </CardTitle>
      </CardHeader>

      <CardContent className="relative flex h-[calc(var(--card-h)-36px)] flex-col px-3 pt-1 pb-3">
        {/* Input row (same button style as discoveries) */}
        <div className="mb-2.5 flex items-center gap-2 relative z-20">
          <Input
            ref={inputRef}
            placeholder="Add a task..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="h-9"
          />
          <JellyPlusButton ref={plusBtnRef} onClick={addTask} />
        </div>

        {/* List */}
        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-16 pr-1"
        >
          {tasks.length === 0 ? (
            <div className={cn("flex h-full items-center justify-center text-base", theme.text)}>
              {"Add your first task!"}
            </div>
          ) : (
            <div className="grid gap-2">
              {tasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onToggle={() => toggleDone(t.id)}
                  onRequestDelete={() => setConfirmId(t.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* In-card delete confirm */}
        {confirmId && (
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
                    setTasks((prev) => prev.filter((x) => x.id !== confirmId))
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

function TaskItem({
  task,
  onToggle,
  onRequestDelete,
}: {
  task: Task
  onToggle: () => void
  onRequestDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const pRef = useRef<HTMLParagraphElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const [fullH, setFullH] = useState(0)
  const [collapsedH, setCollapsedH] = useState(0)
  const [celebrate, setCelebrate] = useState(false)

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
    const t = setTimeout(measure, 300)
    return () => {
      window.removeEventListener("resize", onResize)
      clearTimeout(t)
    }
  }, [task.text])

  const target = expanded ? fullH : collapsedH
  const hasTarget = target > 0

  function handleToggle() {
    if (!task.done) {
      const rect = containerRef.current?.getBoundingClientRect()
      const cx = rect ? rect.left + rect.width * 0.55 : window.innerWidth * 0.5 // slightly right of center
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.5
      const origin = { x: cx / window.innerWidth, y: cy / window.innerHeight }
      confetti({ particleCount: 120, spread: 66, startVelocity: 40, scalar: 0.9, origin, ticks: 160 })
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 900)
    }
    onToggle()
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: celebrate ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "group relative rounded-xl border p-3",
        "bg-gradient-to-br backdrop-blur",
        accentClasses("pink").cardBg,
        accentClasses("pink").cardBorder,
      )}
    >
      {celebrate && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,182,193,0.35), rgba(255,182,193,0) 60%)",
          }}
        />
      )}

      <div className="flex items-start gap-3">
        <Checkbox checked={!!task.done} onCheckedChange={handleToggle} aria-label="Complete task" className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <motion.div
            className="relative overflow-hidden"
            style={{ height: hasTarget ? target : "auto" }}
            animate={{ height: hasTarget ? target : "auto" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p
              ref={pRef}
              className={cn(
                "text-sm break-words pr-10 pb-6 antialiased",
                task.done && "text-muted-foreground line-through",
              )}
            >
              {task.text}
            </p>
          </motion.div>
        </div>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRequestDelete} aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

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

/* migration */
function loadInitialTasks(): Task[] {
  const v2 = safeParse<Task[]>(getLocal(STORAGE_KEY_V2), [])
  if (v2 && Array.isArray(v2) && v2.length) return v2
  const legacy = safeParse<any>(getLocal(LEGACY_KANBAN_KEY), null)
  if (!legacy || !Array.isArray(legacy)) return []
  try {
    const flat: Task[] = legacy.flatMap((col: any) =>
      Array.isArray(col?.tasks)
        ? col.tasks.map((t: any) => ({ id: t.id ?? crypto.randomUUID(), text: String(t.title ?? ""), done: false }))
        : [],
    )
    return flat
  } catch {
    return []
  }
}
