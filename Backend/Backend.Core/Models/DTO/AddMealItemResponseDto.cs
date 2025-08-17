namespace Backend.Core.Models.DTO;

public class AddMealItemResponseDto
{
    public int MealItemId { get; set; }
}

public class TotalsDto
{
    public int CaloriesKcal { get; set; }
    public int ProteinG { get; set; }
    public int CarbsG { get; set; }
    public int FatG { get; set; }
}

public class DayTotalsResponseDto
{
    public string Day { get; set; } = string.Empty; 
    public TotalsDto Totals { get; set; } = new();
}

public class DayItemsResponseDto
{
    public string Day { get; set; } = string.Empty; 
    public List<MealItemForDayDto> Items { get; set; } = new();
}