using Backend.API.WebUtility;
using Backend.Core.Models.Domain;
using Backend.Core.Models.DTO;
using Backend.Infrastructure.Data;
using Backend.Infrastructure.Repositories;
using Backend.Infrastructure.Services;
using FluentAssertions;
using Xunit;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Backend.Tests.Integration;

public class MealTotalsTests : IAsyncLifetime
{
    private BackendDbContext _backendDbContext;
    private MealRepository _mealRepository;
    private SqliteConnection _sqliteConnectionFactory;

    
    public async Task InitializeAsync()
    {
        _sqliteConnectionFactory = new SqliteConnection("DataSource=:memory:");
        await _sqliteConnectionFactory.OpenAsync();
        
        using (var cmd = _sqliteConnectionFactory.CreateCommand())
        {
            cmd.CommandText = "PRAGMA foreign_keys = OFF;";
            await cmd.ExecuteNonQueryAsync();
        }

        var options = new DbContextOptionsBuilder<BackendDbContext>()
            .UseSqlite(_sqliteConnectionFactory)
            .Options;

        _backendDbContext = new BackendDbContext(options);

        await _backendDbContext.Database.EnsureCreatedAsync();

        _backendDbContext.UserProfile.Add(new UserProfile { UserId = 3, TimeZone = "Europe/London"});
        _backendDbContext.Food.Add(new Food
        {
            Barcode = "123",
            EnergyKcal100G = 150m,
            ProteinG100G = 10m,
            CarbsG100G = 20m,
            FatG100G = 5m
        });
        await _backendDbContext.SaveChangesAsync();
        
        var gamificationRepo = new GamificationRepository(_backendDbContext);
        var gamificationService = new GamificationService(gamificationRepo, _backendDbContext);
        
        _mealRepository = new MealRepository(_backendDbContext,  gamificationService);
    }

    public async Task DisposeAsync()
    {
        if (_backendDbContext != null)
            await _backendDbContext.DisposeAsync();
        if (_sqliteConnectionFactory != null)
            await _sqliteConnectionFactory.DisposeAsync();
    }

    [Fact]
    public async Task Adjust_Totals()
    {
        var mealItem = await _mealRepository.AddItemAsync(3, new AddMealItemRequestDto()
        {
            Barcode = "123",
            Unit = "100g",
            Quantity = 2d,
            MealType = MealType.Breakfast,
            ConsumedAtUtc = DateTime.UtcNow,
        });
        
        mealItem.Should().NotBeNull();
        mealItem.ErrorExist.Should().BeFalse("add should succeed");
        mealItem.Data.Should().NotBeNull();
        var mealItemId = mealItem.Data!.MealItemId;
        
        var gamification = await _backendDbContext.Gamification
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.UserId == 3);
        gamification.Should().NotBeNull("gamification should be created after first meal log");
        gamification!.Xp.Should().Be(10);
        gamification.CurrentStreak.Should().Be(1);
        gamification.Level.Should().Be(1);
        
        var totals = await _mealRepository.GetDayTotalsAsync(3, null);

        totals.Should().NotBeNull();
        totals.ErrorExist.Should().BeFalse("should succeed");
        totals.Data.Should().NotBeNull();

        var t1 = totals.Data.Totals!;
        t1.CaloriesKcal.Should().Be(300);
        t1.ProteinG.Should().Be(20);
        t1.CarbsG.Should().Be(40);
        t1.FatG.Should().Be(10);

        //update
        var updateResp = await _mealRepository.UpdateItemAsync(3, mealItemId, new UpdateMealItemRequestDto
            {
                Unit = "100g",
                Quantity = 1d 
            });

        updateResp.Should().NotBeNull();
        updateResp.ErrorExist.Should().BeFalse("should succeed");
        updateResp.Data.Should().NotBeNull();

        var updated = updateResp.Data!;
        updated.MealItemId.Should().Be(mealItemId);
        updated.QuantityGrams.Should().Be(100); 
        
        var totalsAfterUpdate = await _mealRepository.GetDayTotalsAsync(3, null);
        totalsAfterUpdate.Should().NotBeNull();
        totalsAfterUpdate.ErrorExist.Should().BeFalse();
        totalsAfterUpdate.Data.Should().NotBeNull();

        var t2 = totalsAfterUpdate.Data!.Totals;
        t2.CaloriesKcal.Should().Be(150);
        t2.ProteinG.Should().Be(10);
        t2.CarbsG.Should().Be(20);
        t2.FatG.Should().Be(5);

        //delete
        var deleteResp = await _mealRepository.DeleteItemAsync(3, mealItemId);
        deleteResp.Should().NotBeNull();
        deleteResp.ErrorExist.Should().BeFalse("should succeed");
        deleteResp.Data.Should().Be("Deleted.");

        var totalsAfterDelete = await _mealRepository.GetDayTotalsAsync(3, null);
        totalsAfterDelete.Should().NotBeNull();
        totalsAfterDelete.ErrorExist.Should().BeFalse();
        totalsAfterDelete.Data.Should().NotBeNull();

        var t3 = totalsAfterDelete.Data!.Totals;
        t3.CaloriesKcal.Should().Be(0);
        t3.ProteinG.Should().Be(0);
        t3.CarbsG.Should().Be(0);
        t3.FatG.Should().Be(0);
    }
}