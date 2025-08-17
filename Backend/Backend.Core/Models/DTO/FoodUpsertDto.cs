namespace Backend.Core.Models.DTO;

public class FoodUpsertDto
{
    public string Barcode { get; set; } = string.Empty;
    public string? ProductName { get; set; }
    public string? Brand { get; set; }
    public decimal? EnergyKcal100G { get; set; }
    public decimal? ProteinG100G   { get; set; }
    public decimal? CarbsG100G     { get; set; }
    public decimal? FatG100G       { get; set; }
    public decimal? ServingSizeG   { get; set; }
    public string? Signature { get; set; }
}