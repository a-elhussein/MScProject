using System.Globalization;
using Backend.API.WebUtility;
using Backend.Core.Models.Domain;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.WebUtility;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories;

public class MacroRecommendationRepository: IMacroRecommendationRepository
{
    private readonly BackendDbContext _dbContext;

    public MacroRecommendationRepository(BackendDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public async Task<ApplicationResponseModel<MacroRecommendationResponseDto>> GenerateRecommendationAsync(int userId, MacroRecommendationRequestDto macroRecommendationRequestDto)
    {
        var userProfile = await _dbContext.UserProfile.FirstOrDefaultAsync(u => u.UserId == userId);
        if (userProfile == null)
        {
            return new ApplicationResponseModel<MacroRecommendationResponseDto>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "User not found"
            };
        }
        var day = macroRecommendationRequestDto.Day ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var today = DateTime.Today;
        var age = today.Year - userProfile.DateOfBirth.Year;
        if (today < userProfile.DateOfBirth.ToDateTime(TimeOnly.MinValue).AddYears(age)) age--;

        var bmrBase = 10 * (double)userProfile.WeightKg + 6.25 * userProfile.HeightCm - 5 * age;
        var bmr = userProfile.Sex == Sex.Female ? bmrBase - 161 : bmrBase + 5;

        double multiplier = userProfile.ActivityLevel switch
        {
            ActivityLevel.Sedentary => 1.2,
            ActivityLevel.Light => 1.375,
            ActivityLevel.Moderate => 1.55,
            ActivityLevel.Active => 1.725,
            ActivityLevel.Athlete => 1.9,
            _ => 1.2
        };
        
        int calories = (int)(bmrBase * multiplier);

        if (userProfile.Goal == Goal.Cut) calories -= 500;
        else if (userProfile.Goal == Goal.Bulk) calories += 500;

        int protein = (int)((double)userProfile.WeightKg * 2.2);
        int fat = (int)(calories * 0.25 / 9);
        int carbs = (calories - (protein * 4 + fat * 9)) / 4;

        var macro = new MacroRecommendation
        {
            UserId = userId,
            Day = day,
            CreatedAt = DateTime.UtcNow,
            CaloriesKcal = calories,
            ProteinG = protein,
            CarbsG = carbs,
            FatG = fat
        };

        _dbContext.MacroRecommendation.Add(macro);
        await _dbContext.SaveChangesAsync();

        var response = new MacroRecommendationResponseDto
        {
            Day = macro.Day.ToString("yyyy-MM-dd"),
            CaloriesKcal = macro.CaloriesKcal,
            ProteinG = macro.ProteinG,
            CarbsG = macro.CarbsG,
            FatG = macro.FatG,
            CreatedAt = macro.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        };

        return new ApplicationResponseModel<MacroRecommendationResponseDto>
        {
            Data = response,
            ErrorExist = false,
            ErrorMessage = null
        };
    }

    public async Task<ApplicationResponseModel<List<MacroRecommendationResponseDto>>> GetTrendsAsync(int userId)
    {
        var allRecommendations = await _dbContext.MacroRecommendation
            .Where(m => m.UserId == userId)
            .ToListAsync();

        var latestPerDay = allRecommendations
            .GroupBy(m => m.Day)
            .Select(g => g.OrderByDescending(m => m.CreatedAt).First())
            .OrderBy(m => m.Day)
            .Select(m => new MacroRecommendationResponseDto
            {
                Day = m.Day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                CaloriesKcal = m.CaloriesKcal,
                ProteinG = m.ProteinG,
                CarbsG = m.CarbsG,
                FatG = m.FatG
            })
            .ToList();

        return new ApplicationResponseModel<List<MacroRecommendationResponseDto>>
        {
            Data = latestPerDay,
            ErrorExist = false,
            ErrorMessage = null
        };
    }

    public async Task<ApplicationResponseModel<MacroRecommendationResponseDto>> GetLatestAsync(int userId)
    {
        var latest = await _dbContext.MacroRecommendation
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .FirstOrDefaultAsync();

        if (latest == null)
        {
            return new ApplicationResponseModel<MacroRecommendationResponseDto>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "No macro recommendations was found."
            };
        }

        var dto = new MacroRecommendationResponseDto
        {
            Day = latest.Day.ToString("yyyy-MM-dd"),
            CaloriesKcal = latest.CaloriesKcal,
            ProteinG = latest.ProteinG,
            CarbsG = latest.CarbsG,
            FatG = latest.FatG,
            CreatedAt = latest.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        };

        return new ApplicationResponseModel<MacroRecommendationResponseDto>
        {
            Data = dto,
            ErrorExist = false,
            ErrorMessage = null
        };
    }
    
    public async Task<ApplicationResponseModel<MacroRecommendationResponseDto>> OverrideLatestMacrosAsync(int userId, UpdateLatestMacroDto dto)
    {
        var userProfile = await _dbContext.UserProfile.FirstOrDefaultAsync(u => u.UserId == userId);
        if (userProfile == null)
        {
            return new ApplicationResponseModel<MacroRecommendationResponseDto>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "User not found"
            };
        }

        var latestMacro = await _dbContext.MacroRecommendation
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.Day)
            .FirstOrDefaultAsync();

        if (latestMacro == null)
        {
            return new ApplicationResponseModel<MacroRecommendationResponseDto>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "No macro recommendation found for the user."
            };
        }
        
        latestMacro.CaloriesKcal = dto.CaloriesKcal;
        latestMacro.ProteinG = dto.ProteinG;
        latestMacro.FatG = dto.FatG;
        latestMacro.CarbsG = dto.CarbG;
        latestMacro.CreatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        var response = new MacroRecommendationResponseDto
        {
            Day = latestMacro.Day.ToString("yyyy-MM-dd"),
            CaloriesKcal = latestMacro.CaloriesKcal,
            ProteinG = latestMacro.ProteinG,
            CarbsG = latestMacro.CarbsG,
            FatG = latestMacro.FatG,
            CreatedAt = latestMacro.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        };

        return new ApplicationResponseModel<MacroRecommendationResponseDto>
        {
            Data = response,
            ErrorExist = false,
            ErrorMessage = null
        };
    }
}