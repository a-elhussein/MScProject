import { useQuery } from "@tanstack/react-query";
import {useMemo, useState} from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
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
    const [view, setView] = useState<"recommendations" | "totals">("recommendations");

    const { data, isLoading, error } = useQuery({
        queryKey: ["macroTrends"],
        queryFn: async () => {
            const res = await api.get<AppResponse<MacroRecommendation[]>>("/api/MacroRecommendation/trend");
            if (res.data.errorExist || !res.data.data) throw new Error("Failed to fetch trend data");
            return res.data.data;
        },
    });

    const { data: totalsTrend } = useQuery({
        queryKey: ["mealsTotalsTrend"],
        queryFn: async () => {
            const res = await api.get<AppResponse<{ day: string; totals: Omit<MacroRecommendation, "createdAt"> }[]>>("/api/Meals/MonthlyTotals");
            if (res.data.errorExist || !res.data.data) throw new Error("Failed to fetch totals trend");
            return res.data.data;
        },
    });

    const flattenedTotals = useMemo(() => {
        return totalsTrend?.map((entry) => ({
            day: entry.day,
            caloriesKcal: entry.totals.caloriesKcal,
            proteinG: entry.totals.proteinG,
            carbsG: entry.totals.carbsG,
            fatG: entry.totals.fatG,
        })) ?? [];
    }, [totalsTrend]);

    if (isLoading) return <p>Loading trend data...</p>;
    if (error) return <p>Error loading trends</p>;

    return (
        <div className="w-full h-[420px] bg-card p-4 rounded-lg">
            <Tabs key="macro-tabs" value={view} onValueChange={(val) => setView(val as typeof view)}>
                <TabsList className="mb-4 flex justify-center">
                    <TabsTrigger value="recommendations">Recommended</TabsTrigger>
                    <TabsTrigger value="totals">Consumed</TabsTrigger>
                </TabsList>
                <TabsContent value="recommendations">
                    <br/>
                    <br/>
                    <ResponsiveContainer width="100%" height={300}>
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
                </TabsContent>
                <TabsContent value="totals">
                    <br/>
                    <br/>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={flattenedTotals}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="caloriesKcal" stroke="#4f46e5" name="Calories" />
                            <Line type="monotone" dataKey="proteinG" stroke="#16a34a" name="Protein" />
                            <Line type="monotone" dataKey="carbsG" stroke="#ca8a04" name="Carbs" />
                            <Line type="monotone" dataKey="fatG" stroke="#dc2626" name="Fat" />
                        </LineChart>
                    </ResponsiveContainer>
                </TabsContent>
            </Tabs>
        </div>
    );
}