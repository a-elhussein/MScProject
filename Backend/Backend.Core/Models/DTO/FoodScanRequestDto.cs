namespace Backend.Core.Models.DTO;

public class FoodScanRequestDto
{
    public string Barcode { get; set; } = string.Empty;
    public string Unit { get; set; }
    public double Quantity { get; set; }
}