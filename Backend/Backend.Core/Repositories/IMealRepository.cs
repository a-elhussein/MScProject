using Backend.API.WebUtility;
using Backend.Core.Models.DTO;
using Backend.Core.WebUtility;

namespace Backend.Core.Repositories;

public readonly record struct MacroTotals(int CaloriesKcal, int ProteinG, int CarbsG, int FatG);

public interface IMealRepository
{
    Task<ApplicationResponseModel<AddMealItemResponseDto>>AddItemAsync(int userId, AddMealItemRequestDto dto);
    Task<ApplicationResponseModel<DayTotalsResponseDto>>GetDayTotalsAsync(int userId, string? day);
    Task<ApplicationResponseModel<DayItemsResponseDto>>GetDayItemsAsync(int userId, string? day);
    Task<ApplicationResponseModel<MealItemForDayDto>>UpdateItemAsync(int userId, int mealItemId, UpdateMealItemRequestDto dto);
    Task<ApplicationResponseModel<string>>DeleteItemAsync(int userId, int mealItemId);
}