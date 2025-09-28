import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {useState, useEffect, type FormEvent} from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import {Dialog, DialogContent} from "@/components/ui/dialog.tsx";

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

type UserProfile = {
    weightKg: number;
};

type MacroOverrideEditorProps = {
    open: boolean;
    onClose: () => void;
    onSaved: () => Promise<void>;
};

type UpdateMacroDto = {
    caloriesKcal: number;
    proteinG: number;
    carbG: number;
    fatG: number;
};


export default function MacroOverrideEditor({open, onClose, onSaved}: MacroOverrideEditorProps) {
    const qc = useQueryClient();

    const [calories, setCalories] = useState<number | null>(null);
    const [protein, setProtein] = useState<number>(0);
    const [fat, setFat] = useState<number>(0);
    const [carbs, setCarbs] = useState<number>(0);

    const { data: latestMacro, isLoading: loadingMacro } = useQuery<MacroRecommendation, Error, MacroRecommendation, string[]>({
        queryKey: ["latestMacro"],
        queryFn: async () => {
            const res = await api.get<AppResponse<MacroRecommendation>>("/api/MacroRecommendation/latest");
            if (res.data.errorExist || !res.data.data) throw new Error("Failed to fetch macro data");
            return res.data.data;
        },
    });

    useEffect(() => {
        if (latestMacro) {
            setCalories(latestMacro.caloriesKcal);
            setProtein(latestMacro.proteinG);
            setFat(latestMacro.fatG);
            setCarbs(latestMacro.carbsG);
        }
    }, [latestMacro]);

    const { data: userProfile } = useQuery<UserProfile, Error>({
        queryKey: ["userProfile"],
        queryFn: async () => {
            const res = await api.get<AppResponse<UserProfile>>("/api/UserProfile/Get");
            if (res.data.errorExist || !res.data.data) throw new Error("Failed to fetch user profile");
            return res.data.data;
        },
    });

    const updateMutation = useMutation<void, Error, UpdateMacroDto>({
        mutationFn: async (payload: UpdateMacroDto) => {
            const res = await api.post("/api/MacroRecommendation/latest", payload);
            if (res.data.errorExist) throw new Error(res.data.errorMessage ?? "Update failed");
            return;
        },
        onSuccess: async () => {
            toast.success("Macro updated successfully");
            await qc.invalidateQueries({queryKey: ["macroTrends"]});
            await qc.invalidateQueries({queryKey: ["latestMacro"]});
            await onSaved();
            onClose();
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!calories || !userProfile || !latestMacro) return;

        if (calories < 800){
            toast.error("Calories cannot be less than 800");
            return;
        }

        const difference = Math.abs(calories - (latestMacro as MacroRecommendation).caloriesKcal);
        if (difference > 1000) {
            toast.error("You can only override up to ±1000 kcal");
            return;
        }

        updateMutation.mutate({
            caloriesKcal: calories,
            proteinG: protein,
            carbG: carbs,
            fatG: fat
        });
    };

    if (loadingMacro) return <p>Loading...</p>;
    if (!latestMacro || !userProfile) return <p>Error loading data</p>;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-lg font-bold">Edit Recommended Macros</h2>

                    <div>
                        <label className="block text-sm font-medium">Calories</label>
                        <input
                            type="number"
                            value={calories ?? ""}
                            onChange={(e) => setCalories(Number(e.target.value))}
                            className="border p-2 w-full"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Protein (g)</label>
                            <input
                                type="number"
                                value={protein}
                                onChange={(e) => setProtein(Number(e.target.value))}
                                className="border p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Fat (g)</label>
                            <input
                                type="number"
                                value={fat}
                                onChange={(e) => setFat(Number(e.target.value))}
                                className="border p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Carbs (g)</label>
                            <input
                                type="number"
                                value={carbs}
                                onChange={(e) => setCarbs(Number(e.target.value))}
                                className="border p-2 w-full"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}