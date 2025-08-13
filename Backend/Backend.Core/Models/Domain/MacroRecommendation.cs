using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Core.UtilityModel;

namespace Backend.Core.Models.Domain;

public class MacroRecommendation: StoreBase
{
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))] public virtual UserProfile? UserProfile { get; set; }
    public DateOnly Day { get; set; }
    [Range(0, int.MaxValue)] public int CaloriesKcal { get; set; }
    [Range(0, int.MaxValue)] public int ProteinG { get; set; }
    [Range(0, int.MaxValue)] public int CarbsG { get; set; }
    [Range(0, int.MaxValue)] public int FatG { get; set; }
}