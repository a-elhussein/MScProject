using Backend.Core.Models.Domain;
using Backend.Core.Repositories;
using Backend.Core.WebUtility;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories;

public class GamificationRepository:IGamificationRepository
{
    private readonly BackendDbContext _dbContext;

    public GamificationRepository(BackendDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async Task<ApplicationResponseModel<Gamification?>> GetByIdAsync(int userId)
    {
        var entity = await _dbContext.Gamification.FirstOrDefaultAsync(g => g.UserId == userId);
        return new ApplicationResponseModel<Gamification?>
        {
            Data = entity,
            ErrorExist = false,
            ErrorMessage = null
        };
    }

    public async Task<ApplicationResponseModel<string>> CreateAsync(Gamification model)
    {
        await _dbContext.Gamification.AddAsync(model);
        return new ApplicationResponseModel<string>
        {
            Data = "Gamification record created",
            ErrorExist = false,
            ErrorMessage = null
        };
    }

    public Task<ApplicationResponseModel<string>> UpdateAsync(Gamification model)
    {
        _dbContext.Gamification.Update(model);
        return Task.FromResult(new ApplicationResponseModel<string>
        {
            Data = "Gamification record updated",
            ErrorExist = false,
            ErrorMessage = null
        });
    }
}