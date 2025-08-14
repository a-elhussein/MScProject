using Backend.Core.Models.Domain;
using Backend.Core.Models.DTO;
using Backend.Core.WebUtility;

namespace Backend.Core.Repositories;

public interface IMacroRecommendationRepository
{
    Task<ApplicationResponseModel<MacroRecommendationResponseDto>> GenerateRecommendationAsync(int userId, MacroRecommendationRequestDto dto);
    Task<ApplicationResponseModel<List<MacroRecommendationResponseDto>>> GetTrendsAsync(int userId);
}