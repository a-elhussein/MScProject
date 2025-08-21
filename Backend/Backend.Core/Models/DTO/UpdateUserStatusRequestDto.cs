using Backend.API.WebUtility;

namespace Backend.Core.Models.DTO;

public class UpdateUserStatusRequestDto
{
    public IsActive Status { get; set; }
}