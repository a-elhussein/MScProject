namespace Backend.Core.Models.DTO;

public class MacroRecommendationResponseDto
{
    public string Day { get; set; } = string.Empty; 
    public int CaloriesKcal { get; set; }
    public int ProteinG { get; set; }
    public int CarbsG { get; set; }
    public int FatG { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}