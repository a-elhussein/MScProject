import {useMemo, useState} from "react";
import { Navigate } from "react-router-dom";
import axios from "@/lib/axios.ts";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {Button} from "@/components/ui/button.tsx";
import { PencilLine, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import MacroOverrideEditor from "@/components/MacroOverrideEditor.tsx";
import {useAuth} from "@/context/useAuth.tsx";


type MacroRec = {
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
};

type AppResponse<T> = {
    data: T;
    errorExist: boolean;
    errorMessage: string | null;
};

type LatestMacroResponse = AppResponse<{
    day: string;
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    createdAt: string;
} | null>;

type MealsTotalsResponse = AppResponse<{
    day: string;
    totals: MacroRec;
}>;

function fmt(n: number) {
    return new Intl.NumberFormat().format(n);
}

function toneClassForPct(pct: number) {
    if (pct < 75) {
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900";
    }
    if (pct < 90) {
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900";
    }
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900";
}


function todayDateOnly() {
    return new Date().toISOString().split("T")[0];
}

type ProfileDialogProps = {
    open: boolean;
    onClose: () => void;
    onSaved: () => Promise<void>;
};

function ProfileDialog({open, onClose, onSaved}: ProfileDialogProps) {
    const [dateOfBirth, setDob] = useState("");
    const [heightCm, setHeight] = useState<number | "">("");
    const [weightKg, setWeight] = useState<number | "">("");
    const [activityLevel, setActivity] = useState("1");
    const [goal, setGoal] = useState("1");
    const [sex, setSex] = useState("0");
    const [busy, setBusy] = useState(false);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const qc = useQueryClient();

    const canSubmit =
        !!dateOfBirth &&
        heightCm !== "" &&
        weightKg !== "" &&
        Number(heightCm) >= 50 &&
        Number(heightCm) <= 300 &&
        Number(weightKg) >= 20 &&
        Number(weightKg) <= 500;

    async function handleSave() {
        if (!canSubmit || busy) return;
        setBusy(true);
        try {
            await axios.post("/api/UserProfile/CreateOrUpdate", {
                dateOfBirth,
                heightCm: Number(heightCm),
                weightKg: Number(weightKg),
                activityLevel: Number(activityLevel),
                goal: Number(goal),
                timeZone: tz,
                sex: Number(sex),
            });

            await axios.post("/api/MacroRecommendation/recommend", {
                day: todayDateOnly(),
            });

            qc.setQueryData(["userProfile"], {
                dateOfBirth,
                heightCm: Number(heightCm),
                weightKg: Number(weightKg),
                activityLevel: Number(activityLevel),
                goal: Number(goal),
                sex: Number(sex),
                timeZone: tz,
            });
            await qc.invalidateQueries({queryKey: ["userProfile"]});
            await qc.invalidateQueries({queryKey: ["macroLatest"]});
            await qc.invalidateQueries({queryKey: ["mealsTotals", "today"]});

            await onSaved();
            onClose();
        } catch (e) {
            console.error("Failed to save profile / recommend:", e);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete your profile</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-1">
                        <label className="text-sm">Date of Birth</label>
                        <Input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDob(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1">
                            <label className="text-sm">Height (50-300 cm) </label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                min={50}
                                max={300}
                                value={heightCm}
                                onChange={(e) =>
                                    setHeight(e.target.value === "" ? "" : Number(e.target.value))
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="text-sm">Weight (20-300 kg) </label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                min={20}
                                max={500}
                                value={weightKg}
                                onChange={(e) =>
                                    setWeight(e.target.value === "" ? "" : Number(e.target.value))
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-1">
                        <label className="text-sm">Activity level</label>
                        <Select value={activityLevel} onValueChange={setActivity}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select activity level"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Sedentary — little or no exercise</SelectItem>
                                <SelectItem value="1">Light — 1–3 days/week</SelectItem>
                                <SelectItem value="2">Moderate — 3–5 days/week</SelectItem>
                                <SelectItem value="3">Active — 6–7 days/week</SelectItem>
                                <SelectItem value="4">Athlete — intense daily training</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1">
                        <label className="text-sm">Goal</label>
                        <Select value={goal} onValueChange={setGoal}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select goal"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Cut — lose fat</SelectItem>
                                <SelectItem value="1">Maintain — stay the same</SelectItem>
                                <SelectItem value="2">Bulk — gain muscle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1">
                        <label className="text-sm flex items-center">
                            Sex
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 ml-1 text-gray-500 hover:text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs text-sm">
                                        This is for nutritional formulas and refers to biological sex at birth.
                                        It is not used to define or assume gender identity.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </label>
                        <Select value={sex} onValueChange={setSex}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select sex"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Male</SelectItem>
                                <SelectItem value="1">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={busy}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!canSubmit || busy}>
                        {busy ? "Saving…" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function DashboardPage() {
    const [profileOpen, setProfileOpen] = useState(false);
    const [overrideOpen, setOverrideOpen] = useState(false);
    const { isAdmin } = useAuth();
    const {
        data: latestData,
        isLoading: latestLoading,
        refetch: refetchLatest,
    } = useQuery({
        queryKey: ["macroLatest"],
        queryFn: async () => (await axios.get<LatestMacroResponse>("/api/MacroRecommendation/latest")).data,
        refetchOnMount: "always",
    });

    const {
        data: totalsData,
        isLoading: totalsLoading,
        refetch: refetchTotals,
    } = useQuery({
        queryKey: ["mealsTotals", "today"],
        queryFn: async () => (await axios.get<MealsTotalsResponse>("/api/Meals/Totals")).data,
        refetchOnMount: "always",
    });

    const loading = latestLoading || totalsLoading;

    const macros = useMemo<MacroRec | null>(() => {
        if (!latestData || latestData.errorExist || !latestData.data) return null;
        const {caloriesKcal, proteinG, carbsG, fatG} = latestData.data;
        return {caloriesKcal, proteinG, carbsG, fatG};
    }, [latestData]);

    const consumed = useMemo<MacroRec | null>(() => {
        if (!totalsData || totalsData.errorExist || !totalsData.data?.totals) return null;
        return totalsData.data.totals;
    }, [totalsData]);

    const rows = useMemo(() => {
        if (!macros || !consumed) return [];
        const diff = {
            caloriesKcal: macros.caloriesKcal - consumed.caloriesKcal,
            proteinG: macros.proteinG - consumed.proteinG,
            carbsG: macros.carbsG - consumed.carbsG,
            fatG: macros.fatG - consumed.fatG,
        };
        return [
            {
                label: "Calories",
                unit: "kcal",
                target: macros.caloriesKcal,
                used: consumed.caloriesKcal,
                left: diff.caloriesKcal,
            },
            {
                label: "Protein",
                unit: "g",
                target: macros.proteinG,
                used: consumed.proteinG,
                left: diff.proteinG,
            },
            {
                label: "Carbs",
                unit: "g",
                target: macros.carbsG,
                used: consumed.carbsG,
                left: diff.carbsG,
            },
            {
                label: "Fat",
                unit: "g",
                target: macros.fatG,
                used: consumed.fatG,
                left: diff.fatG,
            },
        ];
    }, [macros, consumed]);

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }
    return (

        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-semibold w-full text-center">Dashboard</h1>
            </div>

            {!isAdmin && !loading && !macros && (
                <Card>
                    <CardHeader>
                        <CardTitle>Finish Setup To Get Your Daily Targets</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                             Complete Your Profile To Calculate Your Macros.
                        </p>
                        <Button onClick={() => setProfileOpen(true)}>Complete profile</Button>
                    </CardContent>
                </Card>
            )}

           <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="items-center">Recommended</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => setOverrideOpen(true)}>
                                <span className="sr-only">Edit Macros</span>
                                <PencilLine className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Edit Macros</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
                        {!loading && macros && (
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <span>🔥 Calories</span>
                                    <Badge variant="outline">{fmt(macros.caloriesKcal)} kcal</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>🥩 Protein</span>
                                    <Badge variant="outline">{fmt(macros.proteinG)} g</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>🍚 Carbs</span>
                                    <Badge variant="outline">{fmt(macros.carbsG)} g</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>🥜 Fat</span>
                                    <Badge variant="outline">{fmt(macros.fatG)} g</Badge>
                                </div>
                            </div>
                        )}
                        {!loading && !macros && (
                            <p className="text-sm text-muted-foreground">No Recommendation Yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Consumed Today</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
                        {!loading && consumed && (
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <span>🔥 Calories</span>
                                    <Badge variant="secondary">{fmt(consumed.caloriesKcal)} kcal</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>🥩 Protein</span>
                                    <Badge variant="secondary">{fmt(consumed.proteinG)} g</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>🍚 Carbs</span>
                                    <Badge variant="secondary">{fmt(consumed.carbsG)} g</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>🥜 Fat</span>
                                    <Badge variant="secondary">{fmt(consumed.fatG)} g</Badge>
                                </div>
                            </div>
                        )}
                        {!loading && !consumed && (
                            <p className="text-sm text-muted-foreground">No Meals Logged Today.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {rows.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Remaining vs. Target</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        {rows.map((r) => {
                            const over = r.left < 0;
                            const pct = r.target > 0 ? (r.used / r.target) * 100 : 0;
                            const tone = toneClassForPct(pct);
                            const barTone =
                                pct >= 90 ? 'bg-red-500' :
                                    pct >= 75 ? 'bg-amber-300' :
                                        'bg-green-500';
                            return (
                                <div key={r.label} className="space-y-1">
                                    <div className="flex items-center justify-between rounded-md border p-2">
                                        <span className="font-medium">{r.label}</span>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">
                                                {fmt(r.used)} / {fmt(r.target)} {r.unit}
                                            </span>
                                            <Badge variant="outline" className={tone}>
                                                {over ? `${fmt(Math.abs(r.left))} over` : `${fmt(r.left)} left`} · {Math.round(pct)}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="w-full bg-muted h-2 rounded">
                                        <div
                                            className={`h-2 rounded ${barTone}`}
                                            style={{width: `${Math.min(pct, 100)}%`}}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            <ProfileDialog
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                onSaved={async () => {
                    await Promise.all([refetchLatest(), refetchTotals()]);
                }}
            />
            <MacroOverrideEditor
                open={overrideOpen}
                onClose={() => setOverrideOpen(false)}
                onSaved={async () => {
                    setOverrideOpen(false);
                    await Promise.all([refetchLatest(), refetchTotals()]);
                }}
            />
        </div>
    );
}
