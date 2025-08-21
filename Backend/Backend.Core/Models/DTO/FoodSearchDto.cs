namespace Backend.Core.Models.DTO;

public class FoodSearchDto
{
    public string Barcode { get; set; }
    public string Name { get; set; }
    public string? Brand { get; set; }
    public decimal? ServingSizeG { get; set; }
    public decimal? EnergyKcal100G { get; set; }
    public decimal? Protein100G { get; set; }
    public decimal? Carbs100G { get; set; }
    public decimal? Fat100G { get; set; }
}