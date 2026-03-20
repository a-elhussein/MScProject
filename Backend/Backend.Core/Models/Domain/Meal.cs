using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.API.WebUtility;
using Backend.Core.UtilityModel;

namespace Backend.Core.Models.Domain;

public class Meal:StoreBase
{
    [Required]
    public int UserId { get; set; } = default!; 
    [ForeignKey(nameof(UserId))]
    public UserProfile UserProfile { get; set; } = default!;
    public DateTime ConsumedAtUtc { get; set; }
    [Required]
    public MealType MealType { get; set; } = default!; 
    public ICollection<MealItem> Items { get; set; } = new List<MealItem>();
}