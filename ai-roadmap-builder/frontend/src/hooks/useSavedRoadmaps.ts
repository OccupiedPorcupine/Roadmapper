import { useState, useEffect, useCallback } from "react";
import { roadmapService } from "@/lib/services/roadmap-service";
import { RoadmapListItem } from "@/types";
import { useSession } from "next-auth/react"; // Assuming we have this or similar, checking imports
// Actually auth.ts usage in client is via SessionProvider usually. 
// Step Id: 31 shows usage of `auth()` in server component passing user to client.
// So this hook might accept `user` or `isLoggedIn` as prop, or we rely on session provider if it exists.
// Looking at HomePageClient, it receives `user` prop.
// I'll make the hook adaptable or just check if fetch call is valid.
// `roadmapService.list()` uses `apiClient` which likely handles auth headers if set.
// The context/saved_roadmaps.md mentions "Call roadmapService.list() on mount (if authenticated)".

export function useSavedRoadmaps(isLoggedIn: boolean) {
    const [roadmaps, setRoadmaps] = useState<RoadmapListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoadmaps = useCallback(async () => {
        if (!isLoggedIn) {
            setRoadmaps([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await roadmapService.list();
            setRoadmaps(data);
        } catch (err) {
            console.error("Failed to fetch roadmaps", err);
            setError("Failed to load roadmaps");
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchRoadmaps();
    }, [fetchRoadmaps]);

    return { roadmaps, loading, error, refresh: fetchRoadmaps };
}
