using Backend.API.WebUtility;
using Backend.Core.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.WebUtility;
using Backend.Infrastructure.Data;

namespace Backend.Infrastructure.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly BackendDbContext _dbContext;

    public UserProfileRepository(BackendDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    
    public async Task<ApplicationResponseModel<UserProfileResponseDto?>> GetAsync(int userId)
    {
        var profile = await _dbContext.UserProfile.SingleOrDefaultAsync(x => x.UserId == userId);

        if (profile == null)
        {
            return new ApplicationResponseModel<UserProfileResponseDto?>
            {
                Data = null,
                ErrorExist = false,
                ErrorMessage = "Profile not found"
            };
        }

        var getUserProfile = new UserProfileResponseDto()
        {
            UserId = profile.UserId,
            DateOfBirth = profile.DateOfBirth,
            HeightCm = profile.HeightCm,
            WeightKg = profile.WeightKg,
            ActivityLevel = profile.ActivityLevel,
            Goal = profile.Goal,
            Sex = profile.Sex,
            TimeZone = profile.TimeZone
        };

        return new ApplicationResponseModel<UserProfileResponseDto?>
        {
            Data = getUserProfile,
            ErrorExist = false,
            ErrorMessage = null
        };
        
    }

    public async Task<ApplicationResponseModel<UserProfileResponseDto?>> CreateOrUpdateAsync(int userId, UserProfileRequestDto userProfileRequestDto)
    {
        try
        {
            var profile = _dbContext.UserProfile.SingleOrDefault(x => x.UserId == userId);
            var isNew = profile == null;

            profile ??= new UserProfile { UserId = userId };

            profile.HeightCm = userProfileRequestDto.HeightCm;
            profile.WeightKg = userProfileRequestDto.WeightKg;
            profile.ActivityLevel = userProfileRequestDto.ActivityLevel;
            profile.Goal = userProfileRequestDto.Goal;
            profile.Sex = userProfileRequestDto.Sex;
            profile.UpdatedAt = DateTime.UtcNow;
            profile.TimeZone = userProfileRequestDto.TimeZone;
            profile.DateOfBirth = userProfileRequestDto.DateOfBirth;
            profile.IsActive = IsActive.Active;
            profile.IsDeleted = IsDeleted.NotDeleted;

            if (isNew)
            {
                _dbContext.UserProfile.Add(profile);
            }
            else
            {
                _dbContext.UserProfile.Update(profile);
            }

            await _dbContext.SaveChangesAsync();

            var getUserProfile = new UserProfileResponseDto()
            {
                UserId = profile.UserId,
                HeightCm = profile.HeightCm,
                WeightKg = profile.WeightKg,
                ActivityLevel = profile.ActivityLevel,
                DateOfBirth = profile.DateOfBirth,
                Goal = profile.Goal,
                Sex = profile.Sex,
                TimeZone = profile.TimeZone
            };

            return new ApplicationResponseModel<UserProfileResponseDto?>
            {
                Data = getUserProfile,
                ErrorExist = false,
                ErrorMessage = null
            };

        }

        catch (Exception)
        {
            return new ApplicationResponseModel<UserProfileResponseDto?>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "An error occured while creating profile"
            };
        }
    }
}