using System.ComponentModel.DataAnnotations;

namespace Backend.Core.Models.DTO;

public class UpdateLatestMacroDto
{
    [Required]
    [Range(800, 10000)]
    public int CaloriesKcal { get; set; }
    public int ProteinG { get; set; }
    public int CarbG { get; set; }
    public int FatG { get; set; }
}