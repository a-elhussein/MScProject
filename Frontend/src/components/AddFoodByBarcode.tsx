import {useEffect, useMemo, useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import BarcodeScannerDialog from "@/components/BarcodeScannerDialog";

type AppResponse<T> = { data: T; errorExist: boolean; errorMessage: string | null };

// ---- API shapes (from your backend) ----
type FoodBase = {
    name: string;
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    barcode: string;
    servingSizeG: number | null;
};

type ImpactPayload = {
    barcode: string;
    unit: "100g" | "serving";
    quantity: number;
};

type ImpactData = {
    food: FoodBase; // scaled to chosen unit+quantity
    impact: {
        protein: { current: number; after: number; goal: number; percentage: number; label: "green" | "amber" | "red" };
        carbs: { current: number; after: number; goal: number; percentage: number; label: "green" | "amber" | "red" };
        fat: { current: number; after: number; goal: number; percentage: number; label: "green" | "amber" | "red" };
        calories: {
            current: number;
            after: number;
            goal: number;
            percentage: number;
            label: "green" | "amber" | "red"
        };
    }
};

type AddItemPayload = {
    barcode: string;
    unit: "100g" | "serving";
    quantity: number;
    mealType: 0 | 1 | 2;     // 0=Breakfast,1=Lunch,2=Dinner
    consumedAtUtc: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onAdded: () => Promise<void>; // parent refetch
    mealType: 0 | 1 | 2;
};

function tone(label: "green" | "amber" | "red") {
    const map = {
        green: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
        amber: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
        red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
    } as const;
    return map[label];
}

export default function AddFoodByBarcode({open, onClose, onAdded, mealType}: Props) {
    const qc = useQueryClient();

    // form
    const [barcode, setBarcode] = useState("");
    const [unit, setUnit] = useState<"100g" | "serving" | "1g">("100g");
    const [quantity, setQuantity] = useState<number | "">("");

    // camera
    const [scanOpen, setScanOpen] = useState(false);

    // results
    const [foodBase, setFoodBase] = useState<FoodBase | null>(null);
    const [impact, setImpact] = useState<ImpactData | null>(null);

    // --- Helpers
    const unitOptions = useMemo(() => {
        const opts: Array<{ value: "100g" | "serving" | "1g"; label: string }> = [
            {value: "100g", label: "100 g"},
            {value: "1g", label: "1 g"},
        ];
        if (foodBase?.servingSizeG && foodBase.servingSizeG > 0) {
            opts.unshift({value: "serving", label: `1 serving (~${foodBase.servingSizeG} g)`});
        }
        return opts;
    }, [foodBase]);

    // Normalize for backend: map UI unit to backend-accepted unit ("100g"|"serving") and adjusted quantity
    // Normalize for backend: map UI unit ("serving" | "100g" | "1g") to backend unit ("serving" | "100g") and quantity
    const {unitNormalized, quantityNormalized} = useMemo<{
        unitNormalized: "100g" | "serving";
        quantityNormalized: number;
    }>(() => {
        const q = typeof quantity === "number" ? quantity : Number(quantity || 0);
        if (unit === "1g") {
            return { unitNormalized: "100g", quantityNormalized: q / 100 };
        }
        const normalizedUnit: "100g" | "serving" = unit === "serving" ? "serving" : "100g";
        return { unitNormalized: normalizedUnit, quantityNormalized: q };
    }, [unit, quantity]);

    const totalGrams = useMemo(() => {
        const q = typeof quantity === "number" ? quantity : Number(quantity || 0);
        if (unit === "1g") return Math.max(0, q);
        if (unit === "serving" && foodBase?.servingSizeG) return Math.max(0, q) * foodBase.servingSizeG;
        return Math.max(0, q) * 100;
    }, [unit, quantity, foodBase]);

  //  const canPreview = !!barcode.trim() && quantityNormalized > 0;
    const canAdd = !!impact;

    // --- Mutations
    const refreshFood = useMutation({
        mutationFn: async (code: string) => {
            const res = await api.post<AppResponse<FoodBase>>(`/api/FoodScan/refresh/${code}`, null);
            if (res.data.errorExist || !res.data.data) throw new Error(res.data.errorMessage ?? "Refresh failed");
            return res.data.data;
        },
        onSuccess: (data) => {
            setFoodBase(data);
            setImpact(null);
            // If serving exists, default the unit to 'serving' for nicer UX
            if (data.servingSizeG && data.servingSizeG > 0) {
                setUnit("serving");
            } else {
                setUnit("100g");
            }
        },
    });

    const previewImpact = useMutation({
        mutationFn: async (payload: ImpactPayload) => {
            const res = await api.post<AppResponse<ImpactData>>(`/api/FoodScan/impact`, payload);
            if (res.data.errorExist || !res.data.data) throw new Error(res.data.errorMessage ?? "Impact failed");
            return res.data.data;
        },
        onSuccess: (data) => setImpact(data),
    });

    const addItem = useMutation({
        mutationFn: async (body: AddItemPayload) => {
            const res = await api.post<AppResponse<{ mealItemId: number }>>(`/api/Meals/AddItem`, body);
            if (res.data.errorExist || !res.data.data) throw new Error(res.data.errorMessage ?? "Add failed");
            return res.data.data;
        },
        onSuccess: async () => {
            // keep UI in sync
            qc.invalidateQueries({queryKey: ["mealsTotals"]});
            await onAdded();
            // reset
            setBarcode("");
            setUnit("100g");
            setQuantity("");
            setFoodBase(null);
            setImpact(null);
            onClose();
        },
    });

    // Auto-refresh UX: if user types an 8–14-digit code and pauses, refresh
    useEffect(() => {
        if (!open) return;
        const trimmed = barcode.trim();
        if (!/^[0-9]{8,14}$/.test(trimmed)) return;
        const id = setTimeout(() => {
            if (!refreshFood.isPending) {
                refreshFood.mutate(trimmed);
            }
        }, 400);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barcode, open]);

    useEffect(() => {
        if (!open) return;
        const trimmed = barcode.trim();

        // must have a product and a valid qty
        if (!trimmed || !foodBase || quantityNormalized <= 0) {
            setImpact(null);
            return;
        }

        const id = setTimeout(() => {
            // fire impact preview
            previewImpact.mutate({
                barcode: trimmed,
                unit: unitNormalized,
                quantity: quantityNormalized,
            });
        }, 300);

        return () => clearTimeout(id);
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, barcode, unitNormalized, quantityNormalized, foodBase]);

    // async function handleManualRefresh() {
    //     const trimmed = barcode.trim();
    //     if (!trimmed) return;
    //     await refreshFood.mutateAsync(trimmed);
    // }

    // async function handlePreview() {
    //     if (!barcode.trim() || quantityNormalized <= 0) return;
    //     const payload: ImpactPayload = {
    //         barcode: barcode.trim(),
    //         unit: unitNormalized,
    //         quantity: quantityNormalized,
    //     };
    //     await previewImpact.mutateAsync(payload);
    // }

    async function handleAdd() {
        if (!impact || quantityNormalized <= 0) return;
        const body: AddItemPayload = {
            barcode: barcode.trim(),
            unit: unitNormalized,
            quantity: quantityNormalized,
            mealType,
            consumedAtUtc: new Date().toISOString(),
        };
        await addItem.mutateAsync(body);
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add by barcode</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    {/* Barcode row */}
                    <div className="grid gap-2">
                        <Label htmlFor="barcode">Barcode</Label>
                        <div className="flex gap-2">
                            <Input
                                id="barcode"
                                placeholder="Type or scan barcode"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                // onKeyDown={(e) => e.key === "Enter" && handleManualRefresh()}
                            />
                            <Button variant="outline" type="button" onClick={() => setScanOpen(true)}>
                                Use camera
                            </Button>
                            {/*<Button type="button" onClick={handleManualRefresh}*/}
                            {/*        disabled={!barcode.trim() || refreshFood.isPending}>*/}
                            {/*    {refreshFood.isPending ? "Refreshing…" : "Refresh"}*/}
                            {/*</Button>*/}
                        </div>
                    </div>

                    {/* Product summary */}
                    {foodBase && (
                        <Card>
                            <CardContent className="p-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{foodBase.name}</div>
                                    {foodBase.servingSizeG ? (
                                        <Badge variant="outline">serving ≈ {foodBase.servingSizeG} g</Badge>
                                    ) : (
                                        <Badge variant="outline">per 100 g</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Unit + quantity */}
                    <div className="grid gap-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label>Unit</Label>
                                <Select value={unit} onValueChange={(v) => setUnit(v as "100g" | "serving" | "1g")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitOptions.map((u) => (
                                            <SelectItem key={u.value} value={u.value}>
                                                {u.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!foodBase?.servingSizeG && (
                                    <p className="text-xs text-muted-foreground">No serving size provided — using per
                                        100 g.</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label>
                                    Quantity{" "}
                                    <span className="text-muted-foreground">
                    ({unit === "serving" ? "servings" : unit === "100g" ? "× 100 g" : "× 1 g"})
                  </span>
                                </Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    placeholder={unit === "serving" ? "e.g., 1" : unit === "100g" ? "e.g., 2 (200 g)" : "e.g., 30 (30 g)"}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                                {totalGrams > 0 && (
                                    <p className="text-xs text-muted-foreground">~ {Math.round(totalGrams)} g total</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/*<div>*/}
                    {/*    <Button onClick={handlePreview} disabled={!canPreview || previewImpact.isPending}>*/}
                    {/*        {previewImpact.isPending ? "Calculating…" : "Preview impact"}*/}
                    {/*    </Button>*/}
                    {/*</div>*/}

                    {/* Impact preview */}
                    {impact && (
                        <div className="grid gap-2 rounded-md border p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span>Calories</span>
                                <Badge variant="outline" className={tone(impact.impact.calories.label)}>
                                    {impact.food.caloriesKcal} kcal · {impact.impact.calories.percentage}%
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Protein</span>
                                <Badge variant="outline" className={tone(impact.impact.protein.label)}>
                                    {impact.food.proteinG} g · {impact.impact.protein.percentage}%
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Carbs</span>
                                <Badge variant="outline" className={tone(impact.impact.carbs.label)}>
                                    {impact.food.carbsG} g · {impact.impact.carbs.percentage}%
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Fat</span>
                                <Badge variant="outline" className={tone(impact.impact.fat.label)}>
                                    {impact.food.fatG} g · {impact.impact.fat.percentage}%
                                </Badge>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleAdd} disabled={!canAdd || addItem.isPending}>
                        {addItem.isPending ? "Adding…" : "Add to meal"}
                    </Button>
                </DialogFooter>

                {/* Camera scanner as a centered dialog */}
                <BarcodeScannerDialog
                    open={scanOpen}
                    onClose={() => setScanOpen(false)}
                    onDetected={async (code) => {
                        setBarcode(code);
                        try {
                            await refreshFood.mutateAsync(code);
                        } finally {
                            setScanOpen(false);
                        }
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}