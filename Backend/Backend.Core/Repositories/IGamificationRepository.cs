using Backend.Core.Models.Domain;
using Backend.Core.WebUtility;

namespace Backend.Core.Repositories;

public interface IGamificationRepository
{
    Task<ApplicationResponseModel<Gamification?>> GetByIdAsync(int id);
    Task<ApplicationResponseModel<string>> CreateAsync(Gamification model);
    Task<ApplicationResponseModel<string>> UpdateAsync(Gamification model);
}