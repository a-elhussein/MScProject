using System.ComponentModel.DataAnnotations;

namespace Backend.API.Models.DTO;

public class LoginRequestDto
{
    [Required]
    public string Username { get; set; }
    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; }
}