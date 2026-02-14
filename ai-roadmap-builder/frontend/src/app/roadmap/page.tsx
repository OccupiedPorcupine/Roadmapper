"use client";

import { useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RoadmapCanvas } from "@/components/features/RoadmapCanvas"
import { NodeDetailPanel } from "@/components/features/NodeDetailPanel"
import { TextShimmer } from "@/components/ui/text-shimmer"
import { useRoadmapStream } from "@/hooks/useRoadmapStream"
import { useRoadmapStore } from "@/store/roadmapStore"
import { useSearchParams } from "next/navigation"

function RoadmapContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q")
  const { generateRoadmap } = useRoadmapStream()
  const nodes = useRoadmapStore((s) => s.nodes)
  const isGenerating = useRoadmapStore((s) => s.isGenerating)
  const lastQ = useRef<string | null>(null)

  useEffect(() => {
    const trimmed = q?.trim()
    if (trimmed && lastQ.current !== trimmed) {
      lastQ.current = trimmed
      generateRoadmap(trimmed)
    }
  }, [q, generateRoadmap])

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Back button upper left */}
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-white/5 hover:text-white"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <RoadmapCanvas />
      {nodes.length === 0 ? (
        <div className="absolute inset-0 z-[1] flex items-center justify-center">
          {isGenerating ? (
            <TextShimmer className="font-mono text-lg" duration={1}>
              Generating roadmap...
            </TextShimmer>
          ) : (
            <p className="text-center text-neutral-500">
              {q?.trim()
                ? "No roadmap generated. Check the backend or try again from the home page."
                : "Add ?q=your-topic to the URL or go back home to generate a roadmap."}
            </p>
          )}
        </div>
      ) : null}
      <NodeDetailPanel />
    </div>
  )
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black text-white flex items-center justify-center">Loading...</div>}>
      <RoadmapContent />
    </Suspense>
  )
}
