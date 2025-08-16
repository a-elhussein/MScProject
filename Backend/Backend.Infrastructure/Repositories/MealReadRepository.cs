using Backend.Core.Repositories;

namespace Backend.Infrastructure.Repositories;

public class MealReadRepository: IMealReadRepository
{
    public Task<MacroTotals> GetTotalsForDayAsync(int userId, DateOnly day) =>
        Task.FromResult(new MacroTotals(0, 0, 0, 0));
    
}