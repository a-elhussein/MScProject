using Backend.API.WebUtility;

namespace Backend.Core.Models.DTO;

public class GetUserDetailsDto
{
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public IsActive IsActive { get; set; }
}