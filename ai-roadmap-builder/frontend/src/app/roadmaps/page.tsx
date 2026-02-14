"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { roadmapService } from "@/lib/services/roadmap-service";
import type { RoadmapListItem } from "@/types";
import { Button as NeonButton } from "@/components/ui/neon-button";
import { formatDistanceToNow } from "date-fns"; // Check if date-fns is installed, otherwise use simple formatter
// I'll check package.json for date-fns. If not, I'll use a simple function.

export default function RoadmapsPage() {
    const [roadmaps, setRoadmaps] = useState<RoadmapListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRoadmaps = async () => {
        try {
            const data = await roadmapService.list();
            setRoadmaps(data);
        } catch (error) {
            console.error("Failed to fetch roadmaps", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm("Are you sure you want to delete this roadmap?")) return;
        try {
            await roadmapService.delete(id);
            setRoadmaps((prev) => prev.filter((r) => r.id !== id));
        } catch (error) {
            console.error("Failed to delete roadmap", error);
            alert("Failed to delete roadmap");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                        My Roadmaps
                    </h1>
                    <Link href="/">
                        <NeonButton>Create New</NeonButton>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading your roadmaps...</div>
                ) : roadmaps.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-xl mb-4">No roadmaps found.</p>
                        <Link href="/">
                            <span className="text-blue-400 hover:underline">Create your first roadmap</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roadmaps.map((map) => (
                            <Link href={`/roadmap/${map.id}`} key={map.id} className="block group">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors relative">
                                    <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors truncate">
                                        {map.title}
                                    </h2>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Created {new Date(map.created_at).toLocaleDateString()}
                                    </p>

                                    <button
                                        onClick={(e) => handleDelete(e, map.id)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors p-2"
                                        title="Delete Roadmap"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
