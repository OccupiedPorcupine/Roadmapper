import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoadmapNode, RoadmapEdge } from "@/types";

const STORAGE_KEY = "roadmap-store";

type RoadmapState = {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  isGenerating: boolean;
  /** True after user has submitted a query; keeps canvas visible until they go back to home */
  showCanvasView: boolean;
  selectedNode: RoadmapNode | null;
  userApiKey: string | null;
  addNode: (node: RoadmapNode) => void;
  addEdge: (edge: RoadmapEdge) => void;
  setGenerating: (status: boolean) => void;
  setShowCanvasView: (show: boolean) => void;
  setSelectedNode: (node: RoadmapNode | null) => void;
  resetRoadmap: () => void;
  setUserApiKey: (key: string | null) => void;
};

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      isGenerating: false,
      showCanvasView: false,
      selectedNode: null,
      userApiKey: null,

      addNode: (node) =>
        set((state) => ({ nodes: [...state.nodes, node] })),

      addEdge: (edge) =>
        set((state) => ({ edges: [...state.edges, edge] })),

      setGenerating: (status) => set({ isGenerating: status }),

      setShowCanvasView: (show) => set({ showCanvasView: show }),

      setSelectedNode: (node) => set({ selectedNode: node }),

      resetRoadmap: () => set({ nodes: [], edges: [], selectedNode: null }),

      setUserApiKey: (key) => set({ userApiKey: key }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ userApiKey: state.userApiKey }),
    }
  )
);
