using System.ComponentModel.DataAnnotations;

namespace Backend.API.Models.DTO;

public class RegisterRequestDto
{
    [Required]
    public string Username { get; set; }
    [Required]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; }
    [Required]
    [DataType(DataType.Password)]
    [StringLength(64, MinimumLength = 8)]
    public string Password { get; set; }
}