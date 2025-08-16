using System.Text.Json;
using System.Text.RegularExpressions;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.Services;
using Backend.Core.Settings;
using Backend.Core.WebUtility;
using Microsoft.Extensions.Options;

namespace Backend.Infrastructure.Services;

public class OpenFoodService: IOpenFoodFactsService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly IMacroRecommendationRepository _macroRecommendationRepository;
    private readonly IMealReadRepository _mealReadRepository;

    public OpenFoodService(HttpClient httpClient, IOptions<OpenFoodFactsApiSettings> apiSettings, IMacroRecommendationRepository  macroRecommendationRepository, IMealReadRepository mealReadRepository)
    {
        _httpClient = httpClient;
        _baseUrl = apiSettings.Value.BaseUrl.TrimEnd('/') + "/";
        _macroRecommendationRepository = macroRecommendationRepository;
        _mealReadRepository = mealReadRepository;
    }
    
    public async Task<ApplicationResponseModel<FoodMacroImpactResponseDto>> GetFoodMacroImpactAsync(FoodScanRequestDto foodScanRequestDto, int userId)
    {
         var resp = await _httpClient.GetAsync($"{_baseUrl}{foodScanRequestDto.Barcode}.json");
            if (!resp.IsSuccessStatusCode)
                return Fail<FoodMacroImpactResponseDto>("Failed to reach OpenFoodFacts.");

            var raw = await resp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(raw);

            if (!doc.RootElement.TryGetProperty("product", out var product))
                return Fail<FoodMacroImpactResponseDto>("Product not found.");

            // nutriments = where per-100g values live
            var nutriments = product.TryGetProperty("nutriments", out var n) ? n : default;

            // Try to read common kcal keys; API varies between products
            double per100Protein = GetDouble(nutriments, "proteins_100g");
            double per100Carbs   = GetDouble(nutriments, "carbohydrates_100g");
            double per100Fat     = GetDouble(nutriments, "fat_100g");
            double per100Kcal    = GetDouble(nutriments, "energy-kcal_100g", "energy-kcal", "energy-kcal_100ml");

            string name = product.TryGetProperty("product_name", out var pName)
                ? (pName.GetString() ?? "Unknown")
                : "Unknown";

            string? servingText = product.TryGetProperty("serving_size", out var sProp) ? sProp.GetString() : null;
            double? servingG = ParseServingSizeInGrams(servingText); // null if missing/unparseable

            // --- 2) choose base grams from user's selection ---
            string unit = foodScanRequestDto.Unit?.Trim().ToLowerInvariant();

            if (unit == "serving" && servingG is null)
            {
                return Fail<FoodMacroImpactResponseDto>("Serving size is not available for this product.");
            }
            
            double baseGrams = unit switch
            {
                "serving" => servingG ?? 100, // if no serving size in API, fallback to 100g
                "1g"      => 1,
                _         => 100 // "100g" default
            };

            // Apply Quantity: total grams eaten for this scan
            double totalGrams = baseGrams * foodScanRequestDto.Quantity;
            double factor = totalGrams / 100.0; // convert per-100g to per-total

            // Scaled macros (rounded ints for display)
            int addProtein  = (int)Math.Round(per100Protein * factor);
            int addCarbs    = (int)Math.Round(per100Carbs   * factor);
            int addFat      = (int)Math.Round(per100Fat     * factor);
            int addCalories = (int)Math.Round(per100Kcal    * factor);

            var foodDto = new FoodScanResponseDto
            {
                Name = name,
                Barcode = foodScanRequestDto.Barcode,
                CaloriesKcal = addCalories,
                ProteinG = addProtein,
                CarbsG = addCarbs,
                FatG = addFat,
                ServingSizeG = servingG
            };

            // --- 3) current goals = latest recommendation for this user ---
            var latestGoals = await _macroRecommendationRepository.GetLatestAsync(userId);
            int goalProtein  = latestGoals.Data?.ProteinG     ?? 0;
            int goalCarbs    = latestGoals.Data?.CarbsG       ?? 0;
            int goalFat      = latestGoals.Data?.FatG         ?? 0;
            int goalCalories = latestGoals.Data?.CaloriesKcal ?? 0;

            // --- 4) today's consumed totals (stubbed to zeros now) ---
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var consumed = await _mealReadRepository.GetTotalsForDayAsync(userId, today);

            // --- 5) labels per macro ---
            var impact = new MacroImpactResult
            {
                Protein  = MakeLabel(consumed.ProteinG,  addProtein,  goalProtein),
                Carbs    = MakeLabel(consumed.CarbsG,    addCarbs,    goalCarbs),
                Fat      = MakeLabel(consumed.FatG,      addFat,      goalFat),
                Calories = MakeLabel(consumed.CaloriesKcal, addCalories, goalCalories)
            };

            return Ok(new FoodMacroImpactResponseDto { Food = foodDto, Impact = impact });
    }
    
    private static double GetDouble(JsonElement element, params string[] names)
        {
            foreach (var name in names)
            {
                if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out var p))
                {
                    if (p.ValueKind == JsonValueKind.Number && p.TryGetDouble(out var d)) return d;
                    if (p.ValueKind == JsonValueKind.String && double.TryParse(p.GetString(), out var s)) return s;
                }
            }
            return 0d;
        }

        private static double? ParseServingSizeInGrams(string? s)
        {
            if (string.IsNullOrWhiteSpace(s)) return null;
            // Matches "150g", "1 cup (245 g)", "30 g", etc.
            var m = Regex.Match(s, @"(\d+(?:\.\d+)?)\s*g", RegexOptions.IgnoreCase);
            return m.Success && double.TryParse(m.Groups[1].Value, out var grams) ? grams : (double?)null;
        }

        // thresholds:
        // - no goal -> green (avoid scaring users)
        // - <= 95%  -> green
        // - 96-100% -> yellow
        // - > 100%  -> red
        private static MacroLabel MakeLabel(int current, int add, int goal)
        {
            int after = current + add;
            int pct = goal <= 0 ? 0 : (int)Math.Round(after * 100.0 / goal);

            string label =
                goal <= 0 ? "green" :
                pct <= 95 ? "green" :
                pct <= 100 ? "yellow" : "red";

            return new MacroLabel
            {
                Current = current,
                After = after,
                Goal = goal,
                Percentage = pct,
                Label = label
            };
        }

        private static ApplicationResponseModel<T> Ok<T>(T data) => new()
        {
            Data = data,
            ErrorExist = false,
            ErrorMessage = null
        };

        private static ApplicationResponseModel<T> Fail<T>(string message) => new()
        {
            Data = default,
            ErrorExist = true,
            ErrorMessage = message
        };
}
