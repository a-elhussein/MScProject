namespace Backend.Core.Repositories
{
    public interface IMealReadRepository
    {
        Task<MacroTotals> GetTotalsForDayAsync(int userId, DateOnly day);
    }

    public readonly record struct MacroTotals(int CaloriesKcal, int ProteinG, int CarbsG, int FatG);
}