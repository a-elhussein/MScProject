using System.Globalization;
using Backend.Core.Models.Domain;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.WebUtility;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories
{
    public class MealRepository : IMealRepository
    {
        private readonly BackendDbContext _dbContext;

        public MealRepository(BackendDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ApplicationResponseModel<AddMealItemResponseDto>> AddItemAsync(int userId,
            AddMealItemRequestDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Barcode) || dto.Quantity <= 0)
                    return Fail<AddMealItemResponseDto>("Invalid payload");

                // Food must exist in DB (controller should call OFF refresh first)
                var food = await _dbContext.Set<Food>().FirstOrDefaultAsync(f => f.Barcode == dto.Barcode);
                if (food is null) return Fail<AddMealItemResponseDto>("Food not found.");

                // Convert unit+quantity -> grams (strict 'serving')
                var unit = (dto.Unit ?? "100g").Trim().ToLowerInvariant();
                if (unit is not ("serving" or "100g" or "1g")) unit = "100g";
                if (unit == "serving" && food.ServingSizeG is null)
                    return Fail<AddMealItemResponseDto>("Serving size not available.");

                decimal baseGrams = unit switch
                {
                    "serving" => food.ServingSizeG!.Value,
                    "1g" => 1m,
                    _ => 100m
                };
                decimal grams = baseGrams * (decimal)dto.Quantity;

                // Create a new Meal (simple flow)
                var when = dto.ConsumedAtUtc ?? DateTime.UtcNow;
                var meal = new Meal { UserId = userId, MealType = dto.MealType, ConsumedAtUtc = when };
                _dbContext.Meal.Add(meal);
                await _dbContext.SaveChangesAsync();

                // Compute totals from per-100g
                var scale = grams / 100m;
                int kcal = (int)Math.Round(scale * (food.EnergyKcal100G ?? 0));
                int p = (int)Math.Round(scale * (food.ProteinG100G ?? 0));
                int c = (int)Math.Round(scale * (food.CarbsG100G ?? 0));
                int f = (int)Math.Round(scale * (food.FatG100G ?? 0));

                var item = new MealItem
                {
                    MealId = meal.Id,
                    FoodId = food.Id,
                    QuantityGrams = grams,

                    // precomputed totals
                    ProteinG = p, CarbsG = c, FatG = f, CaloriesKcal = kcal,

                    DisplayName = dto.DisplayName ?? food.ProductName
                };

                _dbContext.MealItem.Add(item);
                await _dbContext.SaveChangesAsync();

                return Ok(new AddMealItemResponseDto { MealItemId = item.Id });
            }
            catch (Exception ex)
            {
                return Fail<AddMealItemResponseDto>(ex.Message);
            }
        }


        public async
            Task<ApplicationResponseModel<DayTotalsResponseDto>> GetDayTotalsAsync(int userId, string? day)
        {
            try
            {
                DateOnly d;
                if (string.IsNullOrWhiteSpace(day))
                {
                    d = DateOnly.FromDateTime(DateTime.UtcNow);
                }
                else if (!DateOnly.TryParseExact(day, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None,
                             out d))
                {
                    return Fail<DayTotalsResponseDto>("Invalid.");
                }

                var startUtc = d.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
                var endUtc = startUtc.AddDays(1);

                var agg = await _dbContext.MealItem
                    .Where(i => i.Meal.UserId == userId &&
                                i.Meal.ConsumedAtUtc >= startUtc &&
                                i.Meal.ConsumedAtUtc < endUtc)
                    .GroupBy(_ => 1)
                    .Select(g => new
                    {
                        kcal = g.Sum(x => x.CaloriesKcal),
                        p = g.Sum(x => x.ProteinG),
                        c = g.Sum(x => x.CarbsG),
                        f = g.Sum(x => x.FatG)
                    })
                    .FirstOrDefaultAsync();

                var totalsDto = new TotalsDto
                {
                    CaloriesKcal = agg?.kcal ?? 0,
                    ProteinG = agg?.p ?? 0,
                    CarbsG = agg?.c ?? 0,
                    FatG = agg?.f ?? 0
                };

                return Ok(new DayTotalsResponseDto
                {
                    Day = d.ToString("yyyy-MM-dd"),
                    Totals = totalsDto
                });
            }
            catch (Exception ex)
            {
                return Fail<DayTotalsResponseDto>(ex.Message);
            }
        }

        public async Task<ApplicationResponseModel<DayItemsResponseDto>> GetDayItemsAsync(int userId, string? day)
        {
            try
            {
                DateOnly d;
                if (string.IsNullOrWhiteSpace(day))
                {
                    d = DateOnly.FromDateTime(DateTime.UtcNow);
                }
                else if (!DateOnly.TryParseExact(day, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None,
                             out d))
                {
                    return Fail<DayItemsResponseDto>("Invalid.");
                }

                var startUtc = d.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
                var endUtc = startUtc.AddDays(1);

                var items = await _dbContext.MealItem
                    .Include(i => i.Meal)
                    .Include(i => i.Food)
                    .Where(i => i.Meal.UserId == userId &&
                                i.Meal.ConsumedAtUtc >= startUtc &&
                                i.Meal.ConsumedAtUtc < endUtc)
                    .OrderBy(i => i.Meal.MealType)
                    .ThenBy(i => i.Meal.ConsumedAtUtc)
                    .Select(i => new MealItemForDayDto
                    {
                        MealItemId = i.Id,
                        MealId = i.MealId,
                        MealType = i.Meal.MealType.ToString(),
                        ConsumedAtUtc = i.Meal.ConsumedAtUtc,
                        Name = i.DisplayName ?? (i.Food.ProductName ?? "Item"),
                        QuantityGrams = i.QuantityGrams,
                        CaloriesKcal = i.CaloriesKcal,
                        ProteinG = i.ProteinG,
                        CarbsG = i.CarbsG,
                        FatG = i.FatG,
                        Barcode = i.Food.Barcode
                    })
                    .ToListAsync();

                return Ok(new DayItemsResponseDto
                {
                    Day = d.ToString("yyyy-MM-dd"),
                    Items = items
                });
            }
            catch (Exception ex)
            {
                return Fail<DayItemsResponseDto>(ex.Message);
            }
        }

        private static ApplicationResponseModel<T> Ok<T>(T data) => new() { Data = data, ErrorExist = false };

        private static ApplicationResponseModel<T> Fail<T>(string msg) =>
            new() { ErrorExist = true, ErrorMessage = msg };
    }
}