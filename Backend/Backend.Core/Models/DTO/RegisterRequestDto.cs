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
    public string Password { get; set; }
}