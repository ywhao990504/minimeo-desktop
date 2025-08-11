"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wifi, WifiOff, Cloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { accentClasses } from "@/lib/cute-theme"
import { syncToServer, checkServerConnection } from "@/lib/data-sync"

const theme = accentClasses("pink")

export default function DataSyncButton({ className = "" }: { className?: string }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // 检查服务器连接状态（30秒一次）
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkServerConnection()
      setIsConnected(connected)
    }
    
    checkConnection()
    const interval = setInterval(checkConnection, 30000) // 每30秒检查一次
    
    return () => clearInterval(interval)
  }, [])

  // 自动同步：初始化后立即同步一次，然后每2小时同步一次
  useEffect(() => {
    let isCancelled = false
    const syncNow = async () => {
      const result = await syncToServer()
      if (!isCancelled && result.success) {
        const now = new Date()
        const hh = String(now.getHours()).padStart(2, '0')
        const mm = String(now.getMinutes()).padStart(2, '0')
        setLastSync(`${hh}:${mm}`)
      }
    }
    syncNow()
    const id = setInterval(syncNow, 2 * 60 * 60 * 1000) // 2小时
    return () => {
      isCancelled = true
      clearInterval(id)
    }
  }, [])

  const handleManualSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      const result = await syncToServer()
      if (result.success) {
        const now = new Date()
        const hh = String(now.getHours()).padStart(2, '0')
        const mm = String(now.getMinutes()).padStart(2, '0')
        setLastSync(`${hh}:${mm}`)
      }
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed top-1.5 right-1.5 md:top-3 md:right-3 z-40 rounded-2xl border p-2 shadow",
        "bg-gradient-to-br backdrop-blur",
        theme.cardBg,
        theme.cardBorder,
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1 min-w-[104px]">
        {/* Top row: connection status */}
        <div className="inline-flex items-center gap-1.5">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-pink-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-pink-500" />
          )}
          <span className={cn("text-xs", isConnected ? "text-pink-600" : "text-gray-500")}> 
            {isConnected ? "Connected" : "Offline"}
          </span>
        </div>

        {/* Bottom row: last synced time + manual sync */}
        <div className="inline-flex items-center gap-1.5">
          <div className="text-xs text-gray-600 min-w-[56px] text-center">
            {lastSync ? `${lastSync} synced` : "--:--"}
          </div>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={!isConnected || isSyncing}
            aria-label="Sync now"
            title="Sync now"
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-md",
              !isConnected || isSyncing ? "opacity-60 cursor-not-allowed" : "hover:bg-pink-100",
            )}
          >
            <motion.span
              animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
              transition={isSyncing ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
              className="inline-flex"
            >
              <Cloud className="h-4 w-4 text-pink-500" />
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  )
} 