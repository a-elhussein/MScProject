using Backend.Core.Models.Domain;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories;

public class FoodRepository:IFoodRepository
{
    private readonly BackendDbContext _dbContext;

    public FoodRepository(BackendDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async Task<FoodDto?> GetByBarcodeAsync(string barcode)
    {
        var f = await _dbContext.Set<Food>().AsNoTracking().FirstOrDefaultAsync(x => x.Barcode == barcode);
        return f is null ? null : ToDto(f);
    }

    public async Task<FoodDto> UpsertAsync(FoodUpsertDto foodUpsertDto)
    {
        var f = await _dbContext.Set<Food>().FirstOrDefaultAsync(x => x.Barcode == foodUpsertDto.Barcode);
        if (f is null)
        {
            f = new Food();
            MapUpsert(f, foodUpsertDto);
            f.UpdatedAt = DateTimeOffset.UtcNow;
            _dbContext.Set<Food>().Add(f);
        }
        else
        {
            MapUpsert(f, foodUpsertDto);
            f.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await _dbContext.SaveChangesAsync();
        return ToDto(f);
    }
    
    private static FoodDto ToDto(Food f) => new()
    {
        Id = f.Id,
        Barcode = f.Barcode,
        ProductName = f.ProductName,
        Brand = f.Brand,
        EnergyKcal100G = f.EnergyKcal100G,
        ProteinG100G   = f.ProteinG100G,
        CarbsG100G     = f.CarbsG100G,
        FatG100G       = f.FatG100G,
        ServingSizeG   = f.ServingSizeG,
        UpdatedAt = f.UpdatedAt,
        Signature = f.Signature
    };

    private static void MapUpsert(Food target, FoodUpsertDto src)
    {
        target.Barcode        = src.Barcode;
        target.ProductName    = src.ProductName;
        target.Brand          = src.Brand;
        target.EnergyKcal100G = src.EnergyKcal100G;
        target.ProteinG100G   = src.ProteinG100G;
        target.CarbsG100G     = src.CarbsG100G;
        target.FatG100G       = src.FatG100G;
        target.ServingSizeG   = src.ServingSizeG;
        target.Signature      = src.Signature;
    }
}