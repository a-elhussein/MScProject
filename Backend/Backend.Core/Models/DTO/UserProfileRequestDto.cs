using System.ComponentModel.DataAnnotations;
using Backend.API.WebUtility;

namespace Backend.Core.Models.DTO;

public class UserProfileRequestDto
{
    [Required] public DateOnly DateOfBirth { get; set; }
    [Range(50, 300, ErrorMessage = "Height must be between 50 and 300 cm.")]
    public int HeightCm { get; set; }
    [Range(20, 300, ErrorMessage = "Weight must be between 50 and 300 kg.")]
    [Required] public decimal WeightKg { get; set; }
    [Required] public ActivityLevel ActivityLevel { get; set; }
    [Required] public Goal Goal { get; set; }
    [Required] public string TimeZone { get; set; }
    [Required] public Sex Sex { get; set; }
}