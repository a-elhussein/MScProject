using System.ComponentModel.DataAnnotations.Schema;
using Backend.Core.UtilityModel;

namespace Backend.Core.Models.Domain;

public class MealItem:StoreBase
{
    public int MealId { get; set; }
    [ForeignKey(nameof(MealId))]
    public Meal Meal { get; set; } = default!;
    public int FoodId { get; set; }
    [ForeignKey(nameof(FoodId))]
    public Food Food { get; set; } = default!;
    public decimal QuantityGrams { get; set; }
}