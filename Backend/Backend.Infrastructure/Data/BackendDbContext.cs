using System;
using Backend.API.WebUtility;
using Backend.Core.Models;
using Backend.Core.WebUtility;
using Backend.Core.Models.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;



namespace Backend.Infrastructure.Data;

public class BackendDbContext: IdentityDbContext<ApplicationUser, ApplicationRole, int>
{
    public BackendDbContext(DbContextOptions<BackendDbContext> dbContextOptions) : base(dbContextOptions)
    {
        
    }
    
    public DbSet<UserProfile> UserProfile { get; set; }
    public DbSet<MacroRecommendation> MacroRecommendation { get; set; }
    public DbSet<Food> Food { get; set; }
    public DbSet<Meal> Meal { get; set; }
    public DbSet<MealItem> MealItem { get; set; }
    
    

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<MacroRecommendation>().HasOne(m => m.UserProfile).WithMany()
            .HasForeignKey(m => m.UserId)
            .HasPrincipalKey(u => u.UserId);
        
        builder.Entity<Meal>().HasOne(m => m.UserProfile).WithMany()
            .HasForeignKey(m => m.UserId)
            .HasPrincipalKey(u => u.UserId);
        

        var roles = new List<ApplicationRole>
        {
            new ApplicationRole
            {
                Id = 1,
                Name = "Admin",
                NormalizedName = "ADMIN",
                IsActive = IsActive.Active,
                IsDeleted = IsDeleted.NotDeleted,
            },
            new ApplicationRole
            {
                Id = 2,
                Name = "User",
                NormalizedName = "USER",
                IsActive = IsActive.Active,
                IsDeleted = IsDeleted.NotDeleted,
            }
        };
        builder.Entity<ApplicationRole>().HasData(roles);
    }
}