import { Suspense } from "react"
import { RoadmapClient } from "./RoadmapClient"

// Force this page to be dynamic to avoid static generation errors with searchParams
// Force this page to be dynamic to avoid static generation errors with searchParams
export const dynamic = "force-dynamic"

export default function RoadmapPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = searchParams.q ?? null

  return (
    <Suspense fallback={<div className="h-screen w-full bg-black text-white flex items-center justify-center">Loading...</div>}>
      <RoadmapClient initialQuery={q} />
    </Suspense>
  )
}
