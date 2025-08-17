using Backend.API.WebUtility;

namespace Backend.Core.Models.DTO;

public class AddMealItemRequestDto
{
    public string Barcode { get; set; } = string.Empty;
    public string Unit { get; set; } = "100g";     
    public double Quantity { get; set; } = 1.0;
    public MealType MealType { get; set; } = MealType.Lunch;
    public DateTime? ConsumedAtUtc { get; set; }
    public string? DisplayName { get; set; }
}