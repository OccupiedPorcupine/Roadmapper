"use client";

import React, { useCallback, useEffect, useMemo } from "react"
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  Node,
  NodeProps,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow"
import "reactflow/dist/style.css"
import dagre from "dagre"
import { useRoadmapStore } from "@/store/roadmapStore"
import type { RoadmapEdge, RoadmapNode } from "@/types"
import { Button as NeonButton } from "@/components/ui/neon-button"
import ShineEdge from "@/components/features/edges/ShineEdge"
import { cn } from "@/lib/utils"

const NODE_WIDTH = 180
const NODE_HEIGHT = 44

function getLayoutedElements(
  roadmapNodes: RoadmapNode[],
  roadmapEdges: RoadmapEdge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 100 })

  const nodes: Node[] = roadmapNodes.map((n) => ({
    id: n.id,
    type: "roadmapNode",
    position: n.position ?? { x: 0, y: 0 },
    data: { label: n.label },
  }))

  const edges: Edge[] = roadmapEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    pathOptions: { borderRadius: 24 },
  }))

  nodes.forEach((node) => g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  edges.forEach((edge) => g.setEdge(edge.source, edge.target))

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const layoutNode = g.node(node.id)
    if (!layoutNode) return node
    return {
      ...node,
      position: {
        x: layoutNode.x - NODE_WIDTH / 2,
        y: layoutNode.y - NODE_HEIGHT / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

function RoadmapNodeComponent({ data, selected }: NodeProps<{ label: string }>) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      <NeonButton
        as="div"
        variant="default"
        neon={true}
        className={cn(
          "!h-11 !min-w-[140px] !w-[180px] !cursor-default text-white",
          selected && "ring-2 ring-white/20 ring-offset-2 ring-offset-black"
        )}
      >
        <span className="truncate block w-full">{data.label}</span>
      </NeonButton>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
    </>
  )
}

const nodeTypes = { roadmapNode: RoadmapNodeComponent }
const edgeTypes = { shine: ShineEdge }

function RoadmapCanvasInner() {
  const storeNodes = useRoadmapStore((s) => s.nodes)
  const storeEdges = useRoadmapStore((s) => s.edges)
  const setSelectedNode = useRoadmapStore((s) => s.setSelectedNode)

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(storeNodes, storeEdges),
    [storeNodes, storeEdges]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  useEffect(() => {
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const roadmapNode = storeNodes.find((n) => n.id === node.id) ?? null
      setSelectedNode(roadmapNode)
    },
    [storeNodes, setSelectedNode]
  )

  const currentRoadmapId = useRoadmapStore((s) => s.currentRoadmapId)
  const setRoadmapId = useRoadmapStore((s) => s.setRoadmapId)
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const { roadmapService } = await import("@/lib/services/roadmap-service");

      if (currentRoadmapId) {
        // Update existing
        await roadmapService.update(currentRoadmapId, {
          nodes: storeNodes,
          edges: storeEdges
        })
        alert("Roadmap saved successfully!")
      } else {
        // Create new (Save to Account)
        // We need a title and topic_query. 
        // Title we can infer from the first node or just "My Roadmap" if missing.
        // Topic query we might not have if it was wiped on reload, but store should have it?
        // Actually store doesn't persist the query string in `roadmapStore` explicitly except in URL maybe?
        // Let's use a default title for now.
        const title = storeNodes.length > 0 ? storeNodes[0].data.label : "Untitled Roadmap";
        const newRoadmap = await roadmapService.create({
          title,
          topic_query: "Manual Save", // We don't track the original query in store yet, this is a minor debt.
          nodes: storeNodes,
          edges: storeEdges
        })
        setRoadmapId(newRoadmap.id)
        alert("Roadmap saved to your account!")
      }
    } catch (error) {
      console.error("Failed to save roadmap:", error)
      alert("Failed to save roadmap. Please ensure you are logged in.")
    } finally {
      setIsSaving(false)
    }
  }, [currentRoadmapId, storeNodes, storeEdges, setRoadmapId])

  return (
    <div className="relative h-full w-full bg-black">
      <div className="absolute right-4 top-4 z-10">
        <NeonButton onClick={handleSave} disabled={isSaving} className="!w-auto px-6 text-white">
          {isSaving ? "Saving..." : currentRoadmapId ? "Save Changes" : "Save to Account"}
        </NeonButton>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        edgesUpdatable={false}
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "shine",
          style: { stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 },
        }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={16} />
        <Controls className="!bottom-4 !left-4 !top-auto !border-white/10 !bg-black/60" />
      </ReactFlow>
    </div>
  )
}

export function RoadmapCanvas() {
  return (
    <ReactFlowProvider>
      <RoadmapCanvasInner />
    </ReactFlowProvider>
  )
}
