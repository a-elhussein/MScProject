import { useEffect, useState } from "react";
import api  from "@/lib/axios"; // adjust path if needed

export default function GamificationBadge() {
    const [data, setData] = useState<{ xp: number; level: number; currentStreak: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/api/Gamification");
                if (res.data?.errorExist || !res.data?.data) {
                    throw new Error(res.data?.errorMessage || "Failed to fetch gamification");
                }
                setData(res.data.data);
            } catch (err) {
                console.error("Failed to fetch gamification:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <span className="text-xs text-muted">Loading XP...</span>;
    if (error || !data) return <span className="text-xs text-red-500">Error</span>;

    return (
        <div className="flex items-center gap-2 px-2 py-1 text-xs bg-black text-white rounded">
            <span>🔥 {data.currentStreak} Day Streak</span>
            <span>⭐ Level {data.level}</span>
        </div>
    );
}