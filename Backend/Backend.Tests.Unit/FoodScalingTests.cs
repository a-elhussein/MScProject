using FluentAssertions;

namespace Backend.Tests.Unit;

public class FoodScalingTests
{
    static decimal ToGrams(string unit, decimal g, decimal? servingG) =>
        (unit ?? "100g").Trim().ToLowerInvariant() switch
        {
            "1g" => g,
            "serving" => (servingG ?? 0m) * g,
            _ => 100m * g,
        };

    static (int kcal, int p, int c, int f) Scale(decimal g, decimal k100, decimal p100, decimal c100, decimal f100)
    {
        var portion = g / 100m;
        return ((int)Math.Round(k100*portion), (int)Math.Round(p100*portion), (int)Math.Round(c100*portion), (int)Math.Round(f100*portion));
    }
    
    static string Label(int after, int goal)
    {
        var percent = goal == 0 ? 0 : (int)Math.Round(after * 100m / goal);
        return percent > 100 ? "red" : percent >= 70 ? "yellow" : "green";
    }
    
    [Theory]
    [InlineData("100g",   2, 170, 200)]
    [InlineData("1g",    30, 170, 30)]
    [InlineData("serving", 2, 170, 340)]
    public void ToGrams_ok(string unit, decimal qty, decimal servingG, decimal expected)
        => ToGrams(unit, qty, servingG).Should().Be(expected);
    
    [Fact]
    public void Scale_ok()
        => Scale(340m, 150m, 18m, 10m, 5m).Should().Be((510, 61, 34, 17));
    
    [Theory]
    [InlineData(98, 100, "yellow")]
    [InlineData(52, 100, "green")]
    [InlineData(120, 100, "red")]
    public void Label_ok(int after, int goal, string expected)
        => Label(after, goal).Should().Be(expected);
}