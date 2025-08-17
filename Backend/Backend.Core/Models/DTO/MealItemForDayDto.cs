namespace Backend.Core.Models.DTO;

public class MealItemForDayDto
{
    public int MealItemId { get; set; }
    public int MealId { get; set; }
    public string MealType { get; set; } = string.Empty;
    public DateTime ConsumedAtUtc { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal QuantityGrams { get; set; }
    public int CaloriesKcal { get; set; }
    public int ProteinG { get; set; }
    public int CarbsG { get; set; }
    public int FatG { get; set; }
    public string? Barcode { get; set; }
}