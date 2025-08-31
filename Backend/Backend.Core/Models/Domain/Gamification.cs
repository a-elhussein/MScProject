using System.ComponentModel.DataAnnotations.Schema;
using Backend.Core.UtilityModel;

namespace Backend.Core.Models.Domain;

public class Gamification: StoreBase
{
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual ApplicationUser ApplicationUser { get; set; }
    public int Xp { get; set; }
    public int Level { get; set; }
    public int CurrentStreak { get; set; }
    public DateOnly? LastMealLogDate { get; set; }
}