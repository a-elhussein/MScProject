using Backend.Core.Models.Domain;

namespace Backend.Core.Repositories;

public interface ITokenRepository
{
    string CreateJwtToken(ApplicationUser user, List<string> roles);
}