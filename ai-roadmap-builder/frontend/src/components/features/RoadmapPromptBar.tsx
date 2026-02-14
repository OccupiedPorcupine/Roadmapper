"use client";

import { useRef } from "react"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const PLACEHOLDER = "e.g., Astrophysics, Pottery, React Native..."

interface RoadmapPromptBarProps {
  onSubmit: (value: string) => void
  isGenerating: boolean
  onBackToHome?: () => void
  className?: string
}

export function RoadmapPromptBar({
  onSubmit,
  isGenerating,
  onBackToHome,
  className,
}: RoadmapPromptBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = inputRef.current?.value?.trim()
    if (value) onSubmit(value)
  }

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-10 flex items-center gap-4 px-4",
        onBackToHome ? "justify-between" : "justify-center",
        "transition-all duration-300",
        className
      )}
    >
      {onBackToHome ? (
        <button
          type="button"
          onClick={onBackToHome}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>
      ) : null}
      <form onSubmit={handleSubmit} className="min-w-0 flex-1 max-w-xl">
        <div className="glass-border-glow relative rounded-xl p-1.5">
          <input
            ref={inputRef}
            type="text"
            placeholder={PLACEHOLDER}
            disabled={isGenerating}
            className="relative z-10 w-full rounded-lg bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none disabled:opacity-60"
            aria-label="What do you want to learn?"
          />
        </div>
      </form>
      {onBackToHome ? <div className="w-[100px] shrink-0" /> : null}
    </div>
  )
}
