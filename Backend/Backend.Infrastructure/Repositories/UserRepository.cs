using Backend.API.Models.DTO;
using Backend.API.WebUtility;
using Backend.Core.Models.Domain;
using Backend.Core.Repositories;
using Backend.Core.WebUtility;
using Microsoft.AspNetCore.Identity;

namespace Backend.Core.Auth;

public class UserRepository: IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenRepository _tokenRepository;

    public UserRepository(UserManager<ApplicationUser> userManager, ITokenRepository tokenRepository)
    {
        _userManager = userManager;
        _tokenRepository = tokenRepository;
    }

    public async Task<ApplicationResponseModel<string?>> RegisterAsync(RegisterRequestDto  registerRequest)
    {
        var applicationUser = new ApplicationUser
        {
            UserName = registerRequest.Username,
            Email = registerRequest.Email,
            IsActive = IsActive.Active,
            IsDeleted = IsDeleted.NotDeleted
        };
        
        var identityResult = await _userManager.CreateAsync(applicationUser, registerRequest.Password);

        if (identityResult.Succeeded)
        {
            identityResult = await _userManager.AddToRoleAsync(applicationUser, "User");

            if (identityResult.Succeeded)
            {
                return(new ApplicationResponseModel<string>(){Data = "User created successfully!", ErrorExist = false, ErrorMessage = null});
            }
        }
        
        return new ApplicationResponseModel<string?>(){Data = null, ErrorExist = true, ErrorMessage = "Something went wrong!"};
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
    
}