using Backend.Core.Models.DTO;
using Backend.Core.WebUtility;

namespace Backend.Core.Repositories;

public interface IUserProfileRepository
{
    Task<ApplicationResponseModel<UserProfileResponseDto?>> GetAsync(int userId);
    Task<ApplicationResponseModel<UserProfileResponseDto?>> CreateOrUpdateAsync(int userId, UserProfileRequestDto userProfileRequestDto);
}