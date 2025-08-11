"use client"

export default function NoScrollbarStyles() {
  return (
    <style jsx global>{`
      .no-scrollbar {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
      .no-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari */
      }
    `}</style>
  )
}
