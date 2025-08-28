import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type MealItemForEdit = {
    mealItemId: number;
    barcode: string;
    name: string;
    quantityGrams: number;
};

type AppResponse<T> = { data: T; errorExist: boolean; errorMessage: string | null };

type FoodBase = {
    name: string;
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    barcode: string;
    servingSizeG: number | null;
};

// Aggregated totals for today and latest goals
type Totals = { caloriesKcal: number; proteinG: number; carbsG: number; fatG: number };

type LatestRec = {
  day: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  createdAt: string;
};

// Support 100g, serving, and 1g in the UI
type Unit = "100g" | "serving" | "1g";

function gramsFrom(unit: Unit, qty: number, serving: number | null) {
  if (unit === "100g") return qty * 100;
  if (unit === "1g") return qty;
  if (unit === "serving") {
    return serving ? qty * serving : 0;
  }
  return 0;
}

function pct(value: unknown, goal: unknown): number | null {
  const v = Number(value);
  const g = Number(goal);
  if (!Number.isFinite(v) || !Number.isFinite(g) || g <= 0) return null; // not computable
  return Math.round((v / g) * 100);
}

function labelFromPct(p: number | null): "green" | "amber" | "red" {
  if (p == null) return "amber"; // unknown -> neutral
  if (p < 75) return "green";
  if (p <= 90) return "amber";
  return "red";
}

function tone(label: "green" | "amber" | "red") {
  const map = {
    green: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
    amber: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    red:   "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  } as const;
  return map[label];
}

function fmtDelta(n: number, unit: "kcal" | "g") {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const abs = Math.abs(Math.round(n));
  return `${sign}${abs} ${unit}`;
}

type Props = {
    open: boolean;
    item: MealItemForEdit | null;
    onClose: () => void;
};

export default function EditMealItemDialog({ open, item, onClose }: Props) {
    const qc = useQueryClient();

    // product meta
    const [servingSizeG, setServingSizeG] = useState<number | null>(null);
    const [food, setFood] = useState<FoodBase | null>(null);

    // form state
    const [unit, setUnit] = useState<Unit>("100g");
    const [qty, setQty] = useState<number | "">(1);

    // seed when opened
    useEffect(() => {
        if (!open || !item) return;
        // lookup product to know if it has serving size
        (async () => {
            try {
                const res = await api.post<AppResponse<FoodBase>>(`/api/FoodScan/refresh/${item.barcode}`);
                if (!res.data.errorExist && res.data.data) {
                    setServingSizeG(res.data.data.servingSizeG);
                    setFood(res.data.data);
                } else {
                    setServingSizeG(null);
                    setFood(null);
                }
            } catch {
                setServingSizeG(null);
                setFood(null);
            }
        })();

        // baseline default before serving is known
        setUnit("100g");
        setQty(Number((item.quantityGrams / 100).toFixed(2)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, item]);

    // refine defaults after serving is known
    useEffect(() => {
      if (!open || !item) return;
      if (servingSizeG && item.quantityGrams % servingSizeG === 0) {
        setUnit("serving");
        setQty(item.quantityGrams / servingSizeG);
      }
    }, [servingSizeG, open, item]);

    // Today totals
    const totalsQ = useQuery({
      queryKey: ["mealsTotals", "today"],
      queryFn: async (): Promise<Totals> => {
        const r = await api.get<AppResponse<{ day: string; totals: Totals }>>("/api/Meals/Totals");
        if (r.data.errorExist || !r.data.data) throw new Error(r.data.errorMessage ?? "Totals failed");
        return r.data.data.totals;
      },
      enabled: open,
      refetchOnMount: "always",
      staleTime: 0,
    });

    // Latest macro recommendation (goals)
    const goalsQ = useQuery({
      queryKey: ["macroLatest"],
      queryFn: async (): Promise<LatestRec> => {
        const r = await api.get<AppResponse<LatestRec>>("/api/MacroRecommendation/latest");
        if (r.data.errorExist || !r.data.data) throw new Error(r.data.errorMessage ?? "Goals failed");
        return r.data.data;
      },
      enabled: open,
      refetchOnMount: "always",
      staleTime: 0,
    });

    useEffect(() => {
      if (open) {
        totalsQ.refetch();
        goalsQ.refetch();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const numericQty = useMemo(() => {
      if (qty === "") return 0;
      const n = typeof qty === "number" ? qty : parseFloat(String(qty));
      return Number.isFinite(n) ? n : 0;
    }, [qty]);

    // Compute delta and after-save totals locally
    const deltaAndAfter = useMemo(() => {
      if (!food || !item || !totalsQ.data || !goalsQ.data || numericQty <= 0) return null;

      const totalsRaw = totalsQ.data!;
      const goalsRaw = goalsQ.data!;

      // Coerce to numbers defensively in case API sends strings/nulls
      const totals = {
        caloriesKcal: Number(totalsRaw.caloriesKcal) || 0,
        proteinG:     Number(totalsRaw.proteinG)     || 0,
        carbsG:       Number(totalsRaw.carbsG)       || 0,
        fatG:         Number(totalsRaw.fatG)         || 0,
      };

      const goals = {
        caloriesKcal: Number.isFinite(Number(goalsRaw.caloriesKcal)) ? Number(goalsRaw.caloriesKcal) : null,
        proteinG:     Number.isFinite(Number(goalsRaw.proteinG))     ? Number(goalsRaw.proteinG)     : null,
        carbsG:       Number.isFinite(Number(goalsRaw.carbsG))       ? Number(goalsRaw.carbsG)       : null,
        fatG:         Number.isFinite(Number(goalsRaw.fatG))         ? Number(goalsRaw.fatG)         : null,
      } as const;

      const perG = {
        caloriesKcal: food.caloriesKcal / 100,
        proteinG:     food.proteinG     / 100,
        carbsG:       food.carbsG       / 100,
        fatG:         food.fatG         / 100,
      };

      const newGrams = gramsFrom(unit, numericQty, servingSizeG);
      const oldGrams = item.quantityGrams;
      const dG = newGrams - oldGrams; // can be negative

      const delta = {
        caloriesKcal: perG.caloriesKcal * dG,
        proteinG:     perG.proteinG     * dG,
        carbsG:       perG.carbsG       * dG,
        fatG:         perG.fatG         * dG,
      };

      const after = {
        caloriesKcal: totals.caloriesKcal + delta.caloriesKcal,
        proteinG:     totals.proteinG     + delta.proteinG,
        carbsG:       totals.carbsG       + delta.carbsG,
        fatG:         totals.fatG         + delta.fatG,
      };

      const percents = {
        calories: pct(after.caloriesKcal, goals.caloriesKcal),
        protein:  pct(after.proteinG,     goals.proteinG),
        carbs:    pct(after.carbsG,       goals.carbsG),
        fat:      pct(after.fatG,         goals.fatG),
      };

      const labels = {
        calories: labelFromPct(percents.calories),
        protein:  labelFromPct(percents.protein),
        carbs:    labelFromPct(percents.carbs),
        fat:      labelFromPct(percents.fat),
      };

      return { delta, after, percents, labels };
    }, [food, item, totalsQ.data, goalsQ.data, numericQty, unit, servingSizeG]);

    // Save: PATCH /api/Meals/items/{id} with { unit, quantity }
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!item) return;
            const n = typeof qty === "number" ? qty : Number(qty || 0);
            // Convert 1g to 100g for backend compatibility
            const body = unit === "1g"
                ? { unit: "100g", quantity: n / 100 }
                : { unit, quantity: n };
            await api.patch(`/api/Meals/items/${item.mealItemId}`, body);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["mealItems"] });
            qc.invalidateQueries({ queryKey: ["mealsTotals", "today"] });
            qc.refetchQueries({ queryKey: ["mealsTotals", "today"], type: "active" }); // optional immediate refresh
            onClose();
        },
    });

    const disabled = !item || qty === "" || Number(qty) <= 0;

    const unitLabel = useMemo(() => {
        if (unit === "100g") return "× 100 g";
        if (unit === "serving") return servingSizeG ? `× serving (${servingSizeG} g)` : "× serving";
        if (unit === "1g") return "× 1 g";
        return "";
    }, [unit, servingSizeG]);

    const inputStep = unit === "serving" ? 1 : unit === "1g" ? 1 : 0.1;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit “{item?.name ?? ""}”</DialogTitle>
                </DialogHeader>

                {item && (
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Unit</Label>
                            <Select value={unit} onValueChange={(v) => setUnit(v as Unit) }>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="100g">100 g</SelectItem>
                                    {servingSizeG && <SelectItem value="serving">Serving ({servingSizeG} g)</SelectItem>}
                                    <SelectItem value="1g">1 g</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Quantity {unitLabel}</Label>
                            <Input
                              type="number"
                              inputMode="decimal"
                              step={inputStep}
                              min={0}
                              value={qty}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === "") { setQty(""); return; }
                                const n = parseFloat(v);
                                setQty(Number.isFinite(n) ? n : "");
                              }}
                            />
                        </div>

                        <div className="rounded-md border p-3 text-sm grid gap-2">
                          <div className="font-medium">Change if you save</div>
                          {(totalsQ.isLoading || goalsQ.isLoading) && (
                            <p className="text-xs text-muted-foreground">Calculating…</p>
                          )}
                          {totalsQ.isError && <p className="text-xs text-red-600">Couldn’t load today’s totals.</p>}
                          {goalsQ.isError && <p className="text-xs text-red-600">Couldn’t load goals.</p>}
                          {deltaAndAfter && (
                            <div className="grid gap-1">
                              <div className="flex items-center justify-between">
                                <span>Calories</span>
                                <Badge variant="outline" className={tone(deltaAndAfter.labels.calories)}>
                                  {fmtDelta(deltaAndAfter.delta.caloriesKcal, "kcal")} {deltaAndAfter.percents.calories != null && <>· {deltaAndAfter.percents.calories}%</>}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Protein</span>
                                <Badge variant="outline" className={tone(deltaAndAfter.labels.protein)}>
                                  {fmtDelta(deltaAndAfter.delta.proteinG, "g")} {deltaAndAfter.percents.protein != null && <>· {deltaAndAfter.percents.protein}%</>}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Carbs</span>
                                <Badge variant="outline" className={tone(deltaAndAfter.labels.carbs)}>
                                  {fmtDelta(deltaAndAfter.delta.carbsG, "g")} {deltaAndAfter.percents.carbs != null && <>· {deltaAndAfter.percents.carbs}%</>}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Fat</span>
                                <Badge variant="outline" className={tone(deltaAndAfter.labels.fat)}>
                                  {fmtDelta(deltaAndAfter.delta.fatG, "g")} {deltaAndAfter.percents.fat != null && <>· {deltaAndAfter.percents.fat}%</>}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => saveMutation.mutate()} disabled={disabled || saveMutation.isPending}>
                        {saveMutation.isPending ? "Saving…" : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
