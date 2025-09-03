using Backend.API.Models.DTO;
using Backend.API.WebUtility;
using Backend.Core.Models.Domain;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.WebUtility;
using Backend.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Core.Auth;

public class UserRepository: IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenRepository _tokenRepository;
    private readonly BackendDbContext _dbContext;

    public UserRepository(UserManager<ApplicationUser> userManager, ITokenRepository tokenRepository, BackendDbContext  dbContext)
    {
        _userManager = userManager;
        _tokenRepository = tokenRepository;
        _dbContext = dbContext;
    }

    public async Task<ApplicationResponseModel<string?>> RegisterAsync(RegisterRequestDto  registerRequest)
    {
        var applicationUser = new ApplicationUser
        {
            UserName  = registerRequest.Username,
            Email     = registerRequest.Email,
            IsActive  = IsActive.Active,
            IsDeleted = IsDeleted.NotDeleted
        };
        
        var create = await _userManager.CreateAsync(applicationUser, registerRequest.Password);
        if (!create.Succeeded)
        {
            var msg = string.Join("; ", create.Errors.Select(e => $"{e.Code}: {e.Description}"));
            return new ApplicationResponseModel<string?> { Data = null, ErrorExist = true, ErrorMessage = msg };
        }
        
        var addRole = await _userManager.AddToRoleAsync(applicationUser, "User");
        if (!addRole.Succeeded)
        {
            var msg = string.Join("; ", addRole.Errors.Select(e => $"{e.Code}: {e.Description}"));
            return new ApplicationResponseModel<string?> { Data = null, ErrorExist = true, ErrorMessage = msg };
        }
        
        var roles = await _userManager.GetRolesAsync(applicationUser);
        var jwt   = _tokenRepository.CreateJwtToken(applicationUser, roles.ToList());

        return new ApplicationResponseModel<string?> { Data = jwt, ErrorExist = false, ErrorMessage = null };
    }

    public async Task<ApplicationResponseModel<LoginResponseDto?>> LoginAsync(LoginRequestDto loginRequest)
    {
        var user = await _userManager.FindByNameAsync(loginRequest.Username);
        if (user != null)
        {
            var checkPasswordResult =await _userManager.CheckPasswordAsync(user, loginRequest.Password);

            if (checkPasswordResult)
            {
                //Get User Roles
                var roles = await _userManager.GetRolesAsync(user);
                if (roles != null)
                {
                    //Create Token
                    var jwtToken = _tokenRepository.CreateJwtToken(user, roles.ToList());

                    var response = new LoginResponseDto()
                    {
                        jwtToken = jwtToken
                    };
                    
                    return new ApplicationResponseModel<LoginResponseDto?>(){ Data = response, ErrorExist = false, ErrorMessage = null };
                }
            }
        }
        return new ApplicationResponseModel<LoginResponseDto?>(){Data = null, ErrorExist = true, ErrorMessage = "Username or Password is incorrect"};
    }

    // public async Task<ApplicationResponseModel<string>> ResetPasswordAsync(string id, ResetUserPasswordDto resetUserPasswordDto)
    // {
    //     var user = await _userManager.FindByIdAsync(id);
    //     var passwordCheck = await _userManager.CheckPasswordAsync(user, resetUserPasswordDto.CurrentPassword);
    //
    //     if (!passwordCheck)
    //     {
    //         return new ApplicationResponseModel<string>{Data = null, ErrorExist = true, ErrorMessage = "Current Password is incorrect"};
    //     }
    //
    //     if (resetUserPasswordDto.NewPassword != resetUserPasswordDto.ConfirmNewPassword)
    //     {
    //         return new ApplicationResponseModel<string>{Data = null, ErrorExist = true, ErrorMessage = "Passwords do not match"};
    //     }
    //     
    //     var passwordChange = await _userManager.ChangePasswordAsync(user, resetUserPasswordDto.CurrentPassword, resetUserPasswordDto.NewPassword);
    //     return new ApplicationResponseModel<string>{Data = "Password Changed Successfully", ErrorExist = false, ErrorMessage = null};
    // }
    public async Task<ApplicationResponseModel<string>> ResetPasswordAsync(string id, ResetUserPasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return new ApplicationResponseModel<string>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "User not found"
            };
        }

        var passwordCheck = await _userManager.CheckPasswordAsync(user, dto.CurrentPassword);
        if (!passwordCheck)
        {
            return new ApplicationResponseModel<string>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "Current Password is incorrect"
            };
        }

        if (dto.NewPassword != dto.ConfirmNewPassword)
        {
            return new ApplicationResponseModel<string>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "Passwords do not match"
            };
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            return new ApplicationResponseModel<string>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = string.Join(" | ", result.Errors.Select(e => e.Description))
            };
        }

        return new ApplicationResponseModel<string>
        {
            Data = "Password Changed Successfully",
            ErrorExist = false,
            ErrorMessage = null
        };
    }

    public async Task<ApplicationResponseModel<List<GetUserDetailsDto>>> GetAllUsersAsync()
    {
        try
        {
            var allUsers = await _dbContext.Users.ToListAsync();
            
            if (allUsers.Count == 0)
                return new ApplicationResponseModel<List<GetUserDetailsDto>>(){Data = null, ErrorExist = true, ErrorMessage = "No users found"};
            
            var list = new List<GetUserDetailsDto>();
            foreach (var user in allUsers)
            {
                list.Add(new GetUserDetailsDto
                {
                    UserId = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    IsActive = user.IsActive
                });
            }
            return new ApplicationResponseModel<List<GetUserDetailsDto>>(){Data = list, ErrorExist = false, ErrorMessage = null};

        }
        catch (Exception e)
        {
            return new ApplicationResponseModel<List<GetUserDetailsDto>>{Data = null, ErrorExist = true, ErrorMessage = e.Message};
        }
    }

    public async Task<ApplicationResponseModel<string>> EditActiveStatusAsync(int userId, UpdateUserStatusRequestDto updateUserStatusRequestDto)
    {
        try
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return new ApplicationResponseModel<string>(){Data = null, ErrorExist = true, ErrorMessage = "User not found"};
            }
            user.IsActive = updateUserStatusRequestDto.Status;
            await _dbContext.SaveChangesAsync();
            
            return new ApplicationResponseModel<string>(){Data = "User updated successfully!", ErrorExist = false, ErrorMessage = null};
        }
        
        catch (Exception e)
        {
            return new ApplicationResponseModel<string>(){Data = null, ErrorExist = true, ErrorMessage = e.Message};
        }
    }

    public async Task<ApplicationResponseModel<string?>> SetAdminRoleAsync(int userId)
    {
        var user = await  _userManager.FindByIdAsync(userId.ToString());
        if (user == null) 
            return new ApplicationResponseModel<string>(){Data = null, ErrorExist = true, ErrorMessage = "User not found"};
        if (await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return new ApplicationResponseModel<string>(){Data = "User is already an admin", ErrorExist = false, ErrorMessage = null};
        }
        await _userManager.AddToRoleAsync(user, "Admin");
        return new ApplicationResponseModel<string>(){Data = "Admin Role Granted!", ErrorExist = false, ErrorMessage = null};
    }

    public async Task<ApplicationResponseModel<string?>> RegisterAdminAsync(RegisterRequestDto registerRequestDto)
    {
        var applicationUser = new ApplicationUser
        {
            UserName = registerRequestDto.Username,
            Email = registerRequestDto.Email,
            IsActive = IsActive.Active,
            IsDeleted = IsDeleted.NotDeleted
        };
        var create = await _userManager.CreateAsync(applicationUser, registerRequestDto.Password);
        
        if (!create.Succeeded)
        {
            var msg = string.Join("; ", create.Errors.Select(e => $"{e.Code}: {e.Description}"));
            return new ApplicationResponseModel<string?> { Data = null, ErrorExist = true, ErrorMessage = msg };
        }
        
        var addRole = await _userManager.AddToRoleAsync(applicationUser, "Admin");
        if (!addRole.Succeeded)
        {
            var msg = string.Join("; ", addRole.Errors.Select(e => $"{e.Code}: {e.Description}"));
            return new ApplicationResponseModel<string?> { Data = null, ErrorExist = true, ErrorMessage = msg };
        }
        
        var roles = await _userManager.GetRolesAsync(applicationUser);
        
        return new ApplicationResponseModel<string?>(){ Data = "New Admin Created Successfully", ErrorExist = false, ErrorMessage = null };
    }

    public async Task<ApplicationResponseModel<UserInfoDto>> GetUserByIdAsync(int userId)
    {
        var user = await _dbContext.Users
            .Where(u => u.Id == userId)
            .Select(u => new UserInfoDto
            {
                UserId = u.Id,
                UserName = u.UserName,
                Email = u.Email,
                IsActive = u.IsActive
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return new ApplicationResponseModel<UserInfoDto>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "User not found"
            };
        }

        return new ApplicationResponseModel<UserInfoDto>
        {
            Data = user,
            ErrorExist = false,
            ErrorMessage = null
        };
    }
}