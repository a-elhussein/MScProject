using System.ComponentModel.DataAnnotations.Schema;
using Backend.API.WebUtility;
using Backend.Core.UtilityModel;

namespace Backend.Core.Models.Domain;

public class UserProfile: StoreBase
{
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual ApplicationUser ApplicationUser { get; set; }

    public DateOnly DateOfBirth { get; set; }
    public Sex Sex { get; set; }
    public int HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public ActivityLevel ActivityLevel { get; set; }
    public Goal Goal { get; set; }
    public UnitSystem UnitPreference { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string TimeZone { get; set; }
    
}