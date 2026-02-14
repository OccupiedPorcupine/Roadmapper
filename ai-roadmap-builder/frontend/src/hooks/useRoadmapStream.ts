"use client";

import { useCallback } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useRoadmapStore } from "@/store/roadmapStore";
import type { RoadmapNode } from "@/types";

const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
};

export function useRoadmapStream() {
  const addNode = useRoadmapStore((s) => s.addNode);
  const addEdge = useRoadmapStore((s) => s.addEdge);
  const setGenerating = useRoadmapStore((s) => s.setGenerating);
  const setShowCanvasView = useRoadmapStore((s) => s.setShowCanvasView);
  const resetRoadmap = useRoadmapStore((s) => s.resetRoadmap);
  const setRoadmapId = useRoadmapStore((s) => s.setRoadmapId);
  const userApiKey = useRoadmapStore((s) => s.userApiKey);

  const generateRoadmap = useCallback(
    async (query: string): Promise<void> => {
      setShowCanvasView(true);
      resetRoadmap();
      setGenerating(true);

      const url = `${getApiBaseUrl()}/api/generate`;

      // Get token properly - we need to dynmically import or use getSession from next-auth/react
      // But hooks run on client, so getSession is fine.
      const { getSession } = await import("next-auth/react")
      const session = await getSession()
      // @ts-ignore
      const token = session?.accessToken

      try {
        await fetchEventSource(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(userApiKey && { "x-user-api-key": userApiKey }),
            ...(token && { "Authorization": `Bearer ${token}` }),
          },
          body: JSON.stringify({ query }),
          onmessage(ev) {
            try {
              const parsedData = JSON.parse(ev.data) as Record<string, unknown>;

              if (parsedData.type === "meta") {
                setRoadmapId(parsedData.id as string);
              }

              if (parsedData.type === "concept") {
                const data = parsedData.data as { label?: string } | undefined;
                const label =
                  (data && typeof data === "object" && "label" in data
                    ? data.label
                    : parsedData.label) ?? "";
                addNode({ ...parsedData, label } as RoadmapNode);
              }
              if (parsedData.type === "edge") {
                addEdge(parsedData as Parameters<typeof addEdge>[0]);
              }
            } catch {
              // Ignore malformed chunks
            }
          },
          onclose() {
            setGenerating(false);
          },
          onerror(err) {
            setGenerating(false);
            const msg = err?.message ?? String(err);
            if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
              console.error("Rate limit exceeded:", msg);
            }
            throw err;
          },
        });
      } catch {
        setGenerating(false);
      }
    },
    [
      addNode,
      addEdge,
      resetRoadmap,
      setGenerating,
      setShowCanvasView,
      userApiKey,
    ]
  );
  return { generateRoadmap };
}
