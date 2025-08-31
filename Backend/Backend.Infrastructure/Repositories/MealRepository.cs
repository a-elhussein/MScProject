using System.Globalization;
using Backend.API.WebUtility;
using Backend.Core.Models.Domain;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.Services;
using Backend.Core.WebUtility;
using Backend.Infrastructure.Data;
using Backend.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories
{
    public class MealRepository : IMealRepository
    {
        public IGamificationService GamificationService { get; }
        private readonly BackendDbContext _dbContext;
        private readonly IGamificationService _gamificationService;

        public MealRepository(BackendDbContext dbContext, IGamificationService gamificationService)
        {
            GamificationService = gamificationService;
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

                    DisplayName = !string.IsNullOrWhiteSpace(food.ProductName) ? food.ProductName
                        : !string.IsNullOrWhiteSpace(food.Brand) ? food.Brand
                        : food.Barcode
                };

                _dbContext.MealItem.Add(item);
                await _dbContext.SaveChangesAsync();

                await GamificationService.UpdateAfterMealLogAsync(userId);

                return Ok(new AddMealItemResponseDto { MealItemId = item.Id });
            }
            catch (Exception ex)
            {
                return Fail<AddMealItemResponseDto>(ex.Message);
            }
        }


        public async Task<ApplicationResponseModel<DayTotalsResponseDto>> GetDayTotalsAsync(int userId, string? day)
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
                                i.IsDeleted == IsDeleted.NotDeleted &&
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
                                i.IsDeleted == IsDeleted.NotDeleted &&
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
                        Name = string.IsNullOrWhiteSpace(i.DisplayName)
                            ? (i.Food.ProductName ?? "Item")
                            : i.DisplayName,
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

        public async Task<ApplicationResponseModel<MealItemForDayDto>> UpdateItemAsync(int userId, int mealItemId,
            UpdateMealItemRequestDto updateMealItemRequestDto)
        {
            try
            {
                var item = await _dbContext.MealItem.Include(i => i.Meal)
                    .Include(i => i.Food)
                    .FirstOrDefaultAsync(i => i.Id == mealItemId);

                if (item == null || item.IsDeleted == IsDeleted.Deleted)
                {
                    return Fail<MealItemForDayDto>("Item not found.");
                }

                if (item.Meal.UserId != userId)
                {
                    return Fail<MealItemForDayDto>("Auth Issue.");
                }

                // Validate quantity
                if (updateMealItemRequestDto.Quantity <= 0)
                    return Fail<MealItemForDayDto>("Quantity must be greater than zero.");

                // Normalize unit (accepts g/gram/grams/1g, 100g, serving)
                var unit = (updateMealItemRequestDto.Unit ?? "g").Trim().ToLowerInvariant();

                // Resolve grams from unit + quantity

                decimal grams;
                if (unit == "1g")
                {
                    grams = (decimal)updateMealItemRequestDto.Quantity;
                }
                else if (unit == "100g")
                {
                    // multiples of 100g
                    grams = 100m * (decimal)updateMealItemRequestDto.Quantity;
                }
                else if (unit == "serving")
                {
                    // serving(s) * serving size in grams
                    if (item.Food.ServingSizeG is null)
                        return Fail<MealItemForDayDto>("Serving size not available. Use unit 'g' or '100g'.");

                    grams = item.Food.ServingSizeG.Value * (decimal)updateMealItemRequestDto.Quantity;
                }
                else
                {
                    // default to 100g behaviour
                    grams = 100m * (decimal)updateMealItemRequestDto.Quantity;
                }

                // --- Scale existing stored totals by grams ratio (simple + predictable) ---
                var oldGrams = item.QuantityGrams;

                if (oldGrams <= 0) oldGrams = grams; // safety: avoid divide-by-zero for legacy rows

                var ratio = grams / oldGrams; // e.g., 40g->50g => 1.25 (increase 25%)

                item.QuantityGrams = grams;
                item.CaloriesKcal = (int)Math.Round(item.CaloriesKcal * ratio);
                item.ProteinG = (int)Math.Round(item.ProteinG * ratio);
                item.CarbsG = (int)Math.Round(item.CarbsG * ratio);
                item.FatG = (int)Math.Round(item.FatG * ratio);

                await _dbContext.SaveChangesAsync();

                var response = new MealItemForDayDto
                {
                    MealId = item.MealId,
                    MealItemId = item.Id,
                    MealType = item.Meal.MealType.ToString(),
                    ConsumedAtUtc = item.Meal.ConsumedAtUtc,
                    Name = string.IsNullOrWhiteSpace(item.DisplayName)
                        ? (item.Food.ProductName ?? "Item")
                        : item.DisplayName,
                    QuantityGrams = item.QuantityGrams,
                    CaloriesKcal = item.CaloriesKcal,
                    ProteinG = item.ProteinG,
                    CarbsG = item.CarbsG,
                    FatG = item.FatG,
                    Barcode = item.Food.Barcode
                };
                return Ok(response);
            }
            catch (Exception e)
            {
                return Fail<MealItemForDayDto>(e.Message);
            }
        }

        public async Task<ApplicationResponseModel<string>> DeleteItemAsync(int userId, int mealItemId)
        {
            try
            {
                var item = await _dbContext.MealItem.Include(i => i.Meal)
                    .FirstOrDefaultAsync(i => i.Id == mealItemId);

                if (item is null || item.IsDeleted == IsDeleted.Deleted)
                {
                    return Fail<string>("Item not found.");
                }

                if (item.Meal.UserId != userId)
                {
                    return Fail<String>("Auth Issue.");
                }

                item.IsDeleted = IsDeleted.Deleted;
                await _dbContext.SaveChangesAsync();

                return Ok("Deleted.");
            }
            catch (Exception e)
            {
                return Fail<string>(e.Message);
            }
        }

        public async Task<ApplicationResponseModel<List<FoodSearchDto>>> FoodSearchAsync(int userId, string? query, int limit)
        {
            try
            {
                var userItems = _dbContext.MealItem.AsNoTracking().Include(i => i.Food)
                    .Include(i => i.Meal)
                    .Where(i => i.Meal.UserId == userId && i.IsDeleted == IsDeleted.NotDeleted);

                if (!string.IsNullOrWhiteSpace(query))
                {
                    var searchQuery = $"%{query.Trim()}%";

                    userItems = userItems.Where(i => EF.Functions.ILike(i.Food.ProductName ?? string.Empty, searchQuery)
                                                     || EF.Functions.ILike(i.Food.Brand ?? string.Empty, searchQuery));
                }

                var rows = await userItems
                    .GroupBy(i => new { i.Food.Id, i.Food.Barcode })
                    .OrderByDescending(g => g.Max(x => x.Meal.ConsumedAtUtc))
                    .Select(g => new
                    {
                        g.Key.Barcode,
                        
                        Latest = g.OrderByDescending(x => x.Meal.ConsumedAtUtc)
                            .Select(x => new
                            {
                                Name = x.Food.ProductName ?? "Unknown product",
                                Brand = x.Food.Brand,
                                ServingSizeG = x.Food.ServingSizeG,
                                EnergyKcal100G = x.Food.EnergyKcal100G,
                                ProteinG100G = x.Food.ProteinG100G,
                                CarbsG100G = x.Food.CarbsG100G,
                                FatG100G = x.Food.FatG100G
                            })
                            .FirstOrDefault()
                    })
                    .Take(limit)
                    .ToListAsync();

                var result = rows.Select(x => new FoodSearchDto
                {
                    Barcode        = x.Barcode,
                    Name           = x.Latest?.Name ?? "Unknown product",
                    Brand          = x.Latest?.Brand,
                    ServingSizeG   = x.Latest?.ServingSizeG,
                    EnergyKcal100G = x.Latest?.EnergyKcal100G,
                    Protein100G   = x.Latest?.ProteinG100G,
                    Carbs100G     = x.Latest?.CarbsG100G,
                    Fat100G       = x.Latest?.FatG100G
                }).ToList();

                return Ok(result);
            }
            catch (Exception e)
            {
                return Fail<List<FoodSearchDto>>(e.Message);
            }
        }

        private static ApplicationResponseModel<T> Ok<T>(T data) =>
            new() { Data = data, ErrorExist = false };

        private static ApplicationResponseModel<T> Fail<T>(string msg) =>
            new() { ErrorExist = true, ErrorMessage = msg };
    }
}