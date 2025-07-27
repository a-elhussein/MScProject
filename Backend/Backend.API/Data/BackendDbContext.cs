using System;
using Backend.API.Models;
using Backend.API.WebUtility;
using Backend.Core.Models.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.API.Data;

public class BackendDbContext: IdentityDbContext<ApplicationUser, ApplicationRole, int>
{
    public BackendDbContext(DbContextOptions<BackendDbContext> dbContextOptions) : base(dbContextOptions)
    {
        
    }


    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

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