using System.ComponentModel.DataAnnotations;
using Backend.Core.UtilityModel;
using Microsoft.EntityFrameworkCore;

namespace Backend.Core.Models.Domain;

[Index(nameof(Barcode), IsUnique = true)]
public class Food:StoreBase
{
    [Required]
    public string Barcode { get; set; } = default!; 
    public string? ProductName { get; set; }
    public string? Brand { get; set; }
    public decimal? EnergyKcal100G { get; set; }
    public decimal? ProteinG100G { get; set; }
    public decimal? CarbsG100G { get; set; }
    public decimal? FatG100G { get; set; }
    public string? Signature { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public ICollection<MealItem> MealItems { get; set; } = new List<MealItem>();
}