import { Suspense } from "react"
import { RoadmapClient } from "./RoadmapClient"

// Force this page to be dynamic to avoid static generation errors with searchParams
export const dynamic = "force-dynamic"

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black text-white flex items-center justify-center">Loading...</div>}>
      <RoadmapClient />
    </Suspense>
  )
}
