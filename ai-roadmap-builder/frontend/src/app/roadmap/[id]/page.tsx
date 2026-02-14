"use client";

import { useEffect, useState, useCallback } from "react";
import { roadmapService } from "@/lib/services/roadmap-service";
import { useRoadmapStore } from "@/store/roadmapStore";
import { RoadmapCanvas } from "@/components/features/RoadmapCanvas";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SidebarDrawer } from "@/components/features/SidebarDrawer";
import { useSavedRoadmaps } from "@/hooks/useSavedRoadmaps";
import { Menu } from "lucide-react";

export default function RoadmapViewPage({ params }: { params: { id: string } }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check if user is logged in? For now we assume they might be if they are here, 
    // or we just try to fetch. If the hook fails it returns empty list.
    // Ideally we should know if logged in. 
    // simpler: just pass true, the service will fail or return empty if not auth. 
    // actually useSavedRoadmaps accepts isLoggedIn. 
    // We can assume if they are viewing a private roadmap they are likely logged in.
    // Or we can just pass true and let the API handle 401.
    // But the hook relies on isLoggedIn to even try. 
    // Let's default to true for the roadmap page or try to check session.
    // Since this is a client page interacting with a protected resource usually, let's pass true.
    const { roadmaps } = useSavedRoadmaps(true);

    const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                setLoading(true);
                const roadmap = await roadmapService.get(params.id);

                // Update store
                useRoadmapStore.setState({
                    nodes: roadmap.nodes,
                    edges: roadmap.edges,
                    currentRoadmapId: roadmap.id
                });

            } catch (err) {
                console.error("Failed to load roadmap", err);
                setError("Failed to load roadmap.");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchRoadmap();
        }

        return () => {
            // Cleanup if needed
        }
    }, [params.id]);

    if (loading) {
        return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading roadmap...</div>;
    }

    if (error) {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white gap-4">
                <p className="text-red-500">{error}</p>
                <Link href="/" className="text-blue-400 hover:underline">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative bg-[#0a0a0a]">
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors",
                        sidebarOpen && "bg-white/10"
                    )}
                >
                    <Menu className="h-6 w-6" />
                </button>

                <Link href="/" className="text-white/70 hover:text-white bg-black/50 px-3 py-1 rounded backdrop-blur-sm transition-colors text-sm">
                    ← Home
                </Link>

                <span className="text-white/50 text-sm">|</span>

                <span className="text-white/90 text-sm font-medium truncate max-w-[200px]">
                    {/* We could show title here if we had it easily accessible outside store/canvas */}
                    Roadmap
                </span>
            </div>

            <RoadmapCanvas />

            <SidebarDrawer
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                roadmaps={roadmaps}
            />
        </div>
    );
}
