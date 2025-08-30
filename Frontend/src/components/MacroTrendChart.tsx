// src/components/MacroTrendChart.tsx
import { useQuery } from "@tanstack/react-query";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import api from "@/lib/axios.ts";

type MacroRecommendation = {
    day: string;
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt: string;
};

type AppResponse<T> = {
    data: T;
    errorExist: boolean;
    errorMessage: string | null;
};

export default function MacroTrendChart() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["macroTrends"],
        queryFn: async () => {
            const res = await api.get<AppResponse<MacroRecommendation[]>>("/api/MacroRecommendation/trend");
            if (res.data.errorExist || !res.data.data) throw new Error("Failed to fetch trend data");
            return res.data.data;
        },
    });

    if (isLoading) return <p>Loading trend data...</p>;
    if (error) return <p>Error loading trends</p>;

    return (
        <div className="w-full h-[400px] bg-card p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Macro Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="caloriesKcal" stroke="#8884d8" name="Calories" />
                    <Line type="monotone" dataKey="proteinG" stroke="#82ca9d" name="Protein" />
                    <Line type="monotone" dataKey="carbsG" stroke="#ffc658" name="Carbs" />
                    <Line type="monotone" dataKey="fatG" stroke="#ff7f50" name="Fat" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}