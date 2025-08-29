using Backend.API.Models.DTO;
using Backend.Core.Models.DTO;
using Backend.Core.WebUtility;

namespace Backend.Core.Repositories;

public interface IUserRepository
{
    Task<ApplicationResponseModel<string?>> RegisterAsync(RegisterRequestDto  registerRequestDto);
    Task<ApplicationResponseModel<LoginResponseDto?>> LoginAsync(LoginRequestDto loginRequestDto);
    Task <ApplicationResponseModel<string>> ResetPasswordAsync(string id, ResetUserPasswordDto resetUserPasswordDto);
    Task<ApplicationResponseModel<List<GetUserDetailsDto>>> GetAllUsersAsync();
    Task<ApplicationResponseModel<string>> EditActiveStatusAsync(int userId, UpdateUserStatusRequestDto updateUserStatusRequestDto);
    Task<ApplicationResponseModel<string?>> SetAdminRoleAsync(int userId);
}