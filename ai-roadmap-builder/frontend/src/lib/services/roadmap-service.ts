import { apiClient } from "../api-client"
import { RoadmapFull, RoadmapListItem, RoadmapNode, RoadmapEdge } from "../../types"

export const roadmapService = {
    list: async (): Promise<RoadmapListItem[]> => {
        return apiClient.fetch<RoadmapListItem[]>("/roadmaps")
    },

    create: async (data: { title: string; topic_query: string; nodes: RoadmapNode[]; edges: RoadmapEdge[] }): Promise<RoadmapFull> => {
        return apiClient.fetch<RoadmapFull>("/roadmaps", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    get: async (id: string): Promise<RoadmapFull> => {
        return apiClient.fetch<RoadmapFull>(`/roadmaps/${id}`)
    },

    update: async (
        id: string,
        data: {
            title?: string,
            nodes?: RoadmapNode[],
            edges?: RoadmapEdge[]
        }
    ): Promise<RoadmapFull> => {
        return apiClient.fetch<RoadmapFull>(`/roadmaps/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
    },

    delete: async (id: string): Promise<void> => {
        return apiClient.fetch<void>(`/roadmaps/${id}`, {
            method: "DELETE",
        })
    },
}
