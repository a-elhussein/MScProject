using System.ComponentModel.DataAnnotations;

namespace Backend.Core.Models.DTO;

public class ResetUserPasswordDto
{
    [Required]
    public string CurrentPassword { get; set; }
    [Required] 
    [StringLength(64, MinimumLength = 8)]
    public string NewPassword { get; set; }
    [Required] 
    [StringLength(64, MinimumLength = 8)]
    public string ConfirmNewPassword { get; set; }
}