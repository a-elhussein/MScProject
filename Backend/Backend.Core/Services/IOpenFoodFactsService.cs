using Backend.Core.Models.DTO;
using Backend.Core.WebUtility;

namespace Backend.Core.Services;

public interface IOpenFoodFactsService
{
    Task<ApplicationResponseModel<FoodMacroImpactResponseDto>> GetFoodMacroImpactAsync(FoodScanRequestDto foodScanRequestDto, int userId);
}