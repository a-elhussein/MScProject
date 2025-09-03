import {useMemo, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/axios";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import AddFoodByBarcode from "@/components/AddFoodByBarcode";
import EditMealItemDialog, {type MealItemForEdit} from "@/components/EditMealItemDialog";

type AppResponse<T> = { data: T; errorExist: boolean; errorMessage: string | null };
type MealTypeStr = "Breakfast" | "Lunch" | "Dinner" | "Snack";
type MealItem = {
    mealItemId: number;
    mealId: number;
    mealType: MealTypeStr;
    consumedAtUtc: string;
    name: string;
    quantityGrams: number;
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    barcode: string;
};
type ItemsResponse = { day: string; items: MealItem[] };
type MealType = 0 | 1 | 2 | 3;

const mealTone: Record<MealTypeStr, string> = {
    Breakfast: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900",
    Lunch: "bg-sky-50 border-sky-200 dark:bg-sky-950 dark:border-sky-900",
    Dinner: "bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-900",
    Snack: "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-900",
};

export default function LogPage() {
    const qc = useQueryClient();
    const [addOpen, setAddOpen] = useState<MealType | null>(null);
    const [editing, setEditing] = useState<MealItemForEdit | null>(null);
    const [selectedDate, setSelectedDate] = useState(() => new Date());

    const dateStr = selectedDate.toISOString().slice(0, 10);

    const itemsQuery = useQuery({
        queryKey: ["mealItems", dateStr],
        queryFn: async () => {
            const res = await api.get<AppResponse<ItemsResponse>>(`/api/Meals/Items?day=${dateStr}`);
            if (res.data.errorExist || !res.data.data) {
                throw new Error(res.data.errorMessage ?? "Failed to load meal items");
            }
            return res.data.data;
        },
    });

    const grouped = useMemo(() => {
        const base: Record<MealTypeStr, { items: MealItem[]; calTotal: number }> = {
            Breakfast: {items: [], calTotal: 0},
            Lunch: {items: [], calTotal: 0},
            Dinner: {items: [], calTotal: 0},
            Snack: {items: [], calTotal: 0}
        };
        const list = itemsQuery.data?.items ?? [];
        for (const it of list) {
            base[it.mealType].items.push(it);
            base[it.mealType].calTotal += it.caloriesKcal;
        }
        return base;
    }, [itemsQuery.data]);

    const deleteItem = useMutation({
        mutationFn: async (mealItemId: number) => {
            await api.delete(`/api/Meals/items/${mealItemId}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["mealItems", selectedDate] });
            qc.invalidateQueries({ queryKey: ["mealsTotals", selectedDate] });
        },
    });

    async function handleAdded() {
        qc.invalidateQueries({ queryKey: ["mealItems", selectedDate] });
        qc.invalidateQueries({ queryKey: ["gamification"] });
    }

    const cards: Array<{ key: MealTypeStr; title: string; mt: MealType }> = [
        {key: "Breakfast", title: "Breakfast", mt: 0},
        {key: "Lunch", title: "Lunch", mt: 1},
        {key: "Dinner", title: "Dinner", mt: 2},
        {key: "Snack", title: "Snack and Other", mt: 3},
    ];

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <div className="flex items-baseline justify-between">
                <h1 className="text-4xl font-semibold w-full text-center">Log Food</h1>
                {itemsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
                {itemsQuery.isError && <p className="text-sm text-red-600">Couldn’t load items.</p>}
            </div>
            <div className="flex justify-center gap-4 items-center">
                <Button onClick={() => setSelectedDate(prev => new Date(prev.getTime() - 86400000))}>
                    ← Previous
                </Button>
                <span className="text-sm font-medium">{selectedDate.toDateString()}</span>
                <Button onClick={() => setSelectedDate(prev => new Date(prev.getTime() + 86400000))}>
                    Next →
                </Button>
            </div>
            {cards.map(({key, title, mt}) => {
                const calTotal = grouped[key]?.calTotal ?? 0;
                const items = grouped[key]?.items ?? [];
                return (
                    <Card key={key} className={`w-full ${mealTone[key]}`}>
                        <CardHeader className="flex items-center justify-between flex-row gap-2">
                            <CardTitle className="truncate">{title}</CardTitle>
                            <Badge variant="outline" className="whitespace-nowrap">{calTotal} kcal</Badge>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {items.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center">Nothing logged yet.</p>
                            ) : (
                                <ul className="divide-y divide-border">
                                  {items.map((it) => (
                                    <li key={it.mealItemId} className="py-3">
                                      <div className="md:grid md:grid-cols-3 md:items-center md:gap-3">
                                        <div className="hidden md:flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              setEditing({
                                                mealItemId: it.mealItemId,
                                                quantityGrams: it.quantityGrams,
                                                barcode: it.barcode,
                                                name: it.name,
                                              })
                                            }
                                          >
                                            Edit
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                              if (confirm("Delete this item?")) deleteItem.mutate(it.mealItemId);
                                            }}
                                            disabled={deleteItem.isPending}
                                          >
                                            {deleteItem.isPending ? "Deleting…" : "Delete"}
                                          </Button>
                                        </div>

                                        <div className="text-center md:justify-self-center md:text-center min-w-0">
                                          <div className="font-medium break-words">{it.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {Math.round(it.quantityGrams)} g · {it.caloriesKcal} kcal · P {it.proteinG}g · C {it.carbsG}g · F {it.fatG}g
                                          </div>
                                        </div>

                                        <div className="mt-2 flex justify-center gap-2 md:hidden">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              setEditing({
                                                mealItemId: it.mealItemId,
                                                quantityGrams: it.quantityGrams,
                                                barcode: it.barcode,
                                                name: it.name,
                                              })
                                            }
                                          >
                                            Edit
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                              if (confirm("Delete this item?")) deleteItem.mutate(it.mealItemId);
                                            }}
                                            disabled={deleteItem.isPending}
                                          >
                                            {deleteItem.isPending ? "Deleting…" : "Delete"}
                                          </Button>
                                        </div>

                                        <div className="hidden md:block" />
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                            )}

                            <div className="pt-2">
                                <Button size="sm" onClick={() => setAddOpen(mt)}>Add food</Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            <AddFoodByBarcode
                open={addOpen !== null}
                mealType={(addOpen ?? 0) as 0 | 1 | 2}
                onClose={() => setAddOpen(null)}
                onAdded={handleAdded}
            />

            <EditMealItemDialog
                open={!!editing}
                item={editing}
                onClose={() => setEditing(null)}
            />
        </div>
    );
}