using System.ComponentModel.DataAnnotations;

namespace Backend.Core.Models.DTO;

public class ResetUserPasswordDto
{
    [Required] public string CurrentPassword { get; set; }
    [Required] public string NewPassword { get; set; }
    [Required] public string ConfirmNewPassword { get; set; }
}