using Backend.API.Models.DTO;
using Backend.Core.WebUtility;

namespace Backend.Core.Repositories;

public interface IUserRepository
{
    Task<ApplicationResponseModel<string?>> RegisterAsync(RegisterRequestDto  registerRequestDto);
    Task<ApplicationResponseModel<LoginResponseDto?>> LoginAsync(LoginRequestDto loginRequestDto);
}