using Backend.Core.Models.DTO;
using Backend.Core.WebUtility;

namespace Backend.Core.Services;

public interface IGamificationService
{
    Task<ApplicationResponseModel<GamificationDto>> UpdateAfterMealLogAsync(int userId);
    Task<ApplicationResponseModel<GamificationDto>> GetByUserIdAsync(int userId);
}