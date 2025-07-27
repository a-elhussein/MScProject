using Backend.API.WebUtility;
using Microsoft.AspNetCore.Identity;

namespace Backend.Core.Models.Domain;

public class ApplicationUser:IdentityUser<int>
{
    public IsActive IsActive { get; set; }
    public IsDeleted IsDeleted { get; set; }
}