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
    public decimal ProteinG100G { get; set; }
    public decimal CarbsG100G { get; set; }
    public decimal FatG100G { get; set; }
    public decimal EnergyKcal100G { get; set; }
    public decimal? ServingSizeG { get; set; }
    public int ProteinG { get; set; }
    public int CarbsG { get; set; }
    public int FatG { get; set; }
    public int CaloriesKcal { get; set; }
    public string? DisplayName { get; set; }
}