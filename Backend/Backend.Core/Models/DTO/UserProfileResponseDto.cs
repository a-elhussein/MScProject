using Backend.API.WebUtility;

namespace Backend.Core.Models.DTO;

public class UserProfileResponseDto
{
    public DateOnly DateOfBirth { get; set; }
    public int UserId { get; set; }
    public int HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public ActivityLevel ActivityLevel { get; set; }
    public Goal Goal { get; set; }
    public string TimeZone { get; set; } = "UTC";
}