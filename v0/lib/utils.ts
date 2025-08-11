import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Robust ID generator that works across older browsers/environments
export function generateId(): string {
  try {
    // Prefer Web Crypto randomUUID when available
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      return (crypto as any).randomUUID()
    }
  } catch {
    // ignore
  }
  try {
    // RFC4122 v4 using getRandomValues
    if (typeof crypto !== "undefined" && typeof (crypto as any).getRandomValues === "function") {
      const bytes = new Uint8Array(16)
      ;(crypto as any).getRandomValues(bytes)
      bytes[6] = (bytes[6] & 0x0f) | 0x40
      bytes[8] = (bytes[8] & 0x3f) | 0x80
      const toHex = (n: number) => n.toString(16).padStart(2, "0")
      const b = Array.from(bytes, toHex).join("")
      return `${b.slice(0, 8)}-${b.slice(8, 12)}-${b.slice(12, 16)}-${b.slice(16, 20)}-${b.slice(20)}`
    }
  } catch {
    // ignore
  }
  // Last resort fallback
  return `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}
