// TypeScript data contracts (mirror backend Pydantic schemas)

/** Node data from backend (label, optional description and resources) */
export interface RoadmapNodeData {
  label: string;
  description?: string | null;
  resources?: string[];
}

/** Streamed node from backend; type === 'concept' identifies roadmap nodes */
export interface RoadmapNode {
  type: "concept";
  id: string;
  /** Display label (may be at top level or inside data) */
  label: string;
  position?: { x: number; y: number };
  data?: RoadmapNodeData;
  [key: string]: unknown;
}

/** Edge between two roadmap nodes (source -> target) */
export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  [key: string]: unknown;
}

export interface RoadmapListItem {
  id: string;
  title: string;
  created_at: string;
}

export interface RoadmapFull {
  id: string;
  title: string;
  topic_query: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  created_at: string;
}
