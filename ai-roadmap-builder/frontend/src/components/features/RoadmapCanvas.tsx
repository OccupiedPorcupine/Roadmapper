"use client";

import { useCallback, useEffect, useMemo } from "react"
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

  return (
    <div className="h-full w-full bg-black">
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
