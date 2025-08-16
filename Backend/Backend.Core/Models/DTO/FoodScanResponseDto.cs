namespace Backend.Core.Models.DTO;

public class FoodScanResponseDto
{
    public string Name { get; set; } = string.Empty;
    public int CaloriesKcal { get; set; }
    public int ProteinG { get; set; }
    public int CarbsG { get; set; }
    public int FatG { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public double? ServingSizeG {get; set;}
}