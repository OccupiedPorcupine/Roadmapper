"use client";

import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink } from "lucide-react"
import { useRoadmapStore } from "@/store/roadmapStore"
import type { RoadmapNode } from "@/types"
import { cn } from "@/lib/utils"

function getDescription(node: RoadmapNode): string {
  const data = node.data
  if (data?.description) return data.description
  return `Learn more about ${node.label}.`
}

function getResources(node: RoadmapNode): string[] {
  const data = node.data
  if (data?.resources && Array.isArray(data.resources)) return data.resources
  return []
}

export function NodeDetailPanel() {
  const selectedNode = useRoadmapStore((s) => s.selectedNode)
  const setSelectedNode = useRoadmapStore((s) => s.setSelectedNode)

  const handleClose = () => setSelectedNode(null)

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.25 }}
          className={cn(
            "fixed right-0 top-0 z-50 h-full w-full max-w-md",
            "bg-black/60 backdrop-blur-2xl border-l border-white/10",
            "shadow-2xl"
          )}
          aria-label="Node details"
        >
          <div className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">
                {selectedNode.label}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-300">
              {getDescription(selectedNode)}
            </p>

            <ResourcesSection resources={getResources(selectedNode)} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

interface ResourcesSectionProps {
  resources: string[]
}

function ResourcesSection({ resources }: ResourcesSectionProps) {
  if (resources.length === 0) return null

  return (
    <section className="mt-6 border-t border-white/10 pt-6">
      <h3 className="mb-3 text-sm font-medium text-neutral-400">Resources</h3>
      <ul className="space-y-2">
        {resources.map((url, i) => (
          <li key={`${url}-${i}`}>
            <a
              href={url.startsWith("http") ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 rounded-lg border border-white/10",
                "bg-white/5 px-4 py-3 text-sm text-white",
                "transition hover:bg-white/10 hover:border-white/20"
              )}
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-neutral-400" />
              <span className="truncate">{url}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
