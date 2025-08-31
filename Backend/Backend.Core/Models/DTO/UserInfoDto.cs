using Backend.API.WebUtility;

namespace Backend.Core.Models.DTO;

public class UserInfoDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public IsActive IsActive { get; set; }
}