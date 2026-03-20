import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function GamificationBadge() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["gamification"],
        queryFn: async () => {
            const res = await api.get("/api/Gamification");
            if (res.data?.errorExist || !res.data?.data) {
                throw new Error(res.data?.errorMessage || "Failed to fetch gamification");
            }
            return res.data.data;
        }
    });

    if (isLoading) return <span className="text-xs text-muted">Loading XP...</span>;
    if (isError || !data) return <span className="text-xs text-black">Start A Streak By Logging Foods Daily!</span>;

    return (
        <div className="flex items-center gap-2 px-2 py-1 text-xs bg-black text-white rounded">
            <span>🔥 {data.currentStreak} Day Streak</span>
            <span>⭐ Level {data.level}</span>
        </div>
    );
}