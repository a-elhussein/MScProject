namespace Backend.Core.Models.DTO
{
    public class FoodMacroImpactResponseDto
    {
        public FoodScanResponseDto Food { get; set; } = new();
        public MacroImpactResult Impact { get; set; } = new();
    }

    public class MacroImpactResult
    {
        public MacroLabel Protein { get; set; } = new();
        public MacroLabel Carbs { get; set; } = new();
        public MacroLabel Fat { get; set; } = new();
        public MacroLabel Calories { get; set; } = new();
    }

    public class MacroLabel
    {
        public int Current { get; set; }
        public int After { get; set; }
        public int Goal { get; set; }
        public int Percentage { get; set; }
        public string Label { get; set; } = "green";
    }
}