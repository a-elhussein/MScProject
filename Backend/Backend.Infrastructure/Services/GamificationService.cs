using Backend.Core.Models.Domain;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.Services;
using Backend.Core.WebUtility;
using Backend.Infrastructure.Data;

namespace Backend.Infrastructure.Services;

public class GamificationService:IGamificationService
{
    private readonly IGamificationRepository _gamificationRepository;
    private readonly BackendDbContext _dbContext;

    public GamificationService(IGamificationRepository gamificationRepository, BackendDbContext  dbContext)
    {
        _gamificationRepository = gamificationRepository;
        _dbContext = dbContext;
    }
    public async Task<ApplicationResponseModel<GamificationDto>> UpdateAfterMealLogAsync(int userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var existingResult = await _gamificationRepository.GetByIdAsync(userId);
        var gamification = existingResult.Data;

        if (gamification == null)
        {
            gamification = new Gamification
            {
                UserId = userId,
                Xp = 10,
                CurrentStreak = 1,
                LastMealLogDate = today,
                Level = 1
            };
            await _dbContext.Gamification.AddAsync(gamification);
        }
        else
        {
            gamification.Xp += 10;

            if (gamification.LastMealLogDate == null)
            {
                gamification.CurrentStreak = 1;
            }
            else if (gamification.LastMealLogDate == today.AddDays(-1))
            {
                gamification.CurrentStreak += 1;
            }
            else if (gamification.LastMealLogDate < today.AddDays(-1))
            {
                gamification.CurrentStreak = 1;
            }
            gamification.LastMealLogDate = today;

            if (gamification.Xp >= gamification.Level * 100)
            {
                gamification.Level += 1;
            }
            await _gamificationRepository.UpdateAsync(gamification);
        }
        
        await _dbContext.SaveChangesAsync();

        return new ApplicationResponseModel<GamificationDto>
        {
            Data = new GamificationDto
            {
                Xp = gamification.Xp,
                CurrentStreak = gamification.CurrentStreak,
                Level = gamification.Level
            },
            ErrorExist = false,
            ErrorMessage = null
        };
    }
    
    public async Task<ApplicationResponseModel<GamificationDto>> GetByUserIdAsync(int userId)
    {
        var existingResult = await _gamificationRepository.GetByIdAsync(userId);
        var record = existingResult.Data;

        if (record == null)
        {
            return new ApplicationResponseModel<GamificationDto>
            {
                ErrorExist = true,
                ErrorMessage = "Gamification record not found",
                Data = null
            };
        }

        var dto = new GamificationDto
        {
            Xp = record.Xp,
            Level = record.Level,
            CurrentStreak = record.CurrentStreak
        };

        return new ApplicationResponseModel<GamificationDto>
        {
            Data = dto,
            ErrorExist = false
        };
    }
}