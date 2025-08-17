using Backend.Core.Models.DTO;

namespace Backend.Core.Repositories;

public interface IFoodRepository
{
    Task<FoodDto?> GetByBarcodeAsync(string barcode);
    Task<FoodDto> UpsertAsync(FoodUpsertDto foodUpsertDto);
}