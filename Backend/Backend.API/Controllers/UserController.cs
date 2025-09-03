using System.Security.Claims;
using Backend.API.Models.DTO;
using Backend.API.WebUtility;
using Backend.Core.Auth;
using Backend.Core.Models.Domain;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.WebUtility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IUserRepository _userRepository;

        public UserController(UserManager<ApplicationUser> userManager, IUserRepository userRepository)
        {
            _userManager = userManager;
            _userRepository = userRepository;
        }
        
        
        
        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register([FromBody]RegisterRequestDto registerRequestDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var registerUser = await _userRepository.RegisterAsync(registerRequestDto);

            if (registerUser.ErrorExist)
            {
                return BadRequest(registerUser.ErrorMessage);
            }
            
            return Ok(registerUser);
        }

        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login(LoginRequestDto loginRequestDto)
        {
            var loginUser = await _userRepository.LoginAsync(loginRequestDto);

            if (loginUser.ErrorExist)
            {
                return BadRequest(loginUser.ErrorMessage);
            }
            
            return Ok(loginUser);
        }

        [HttpGet]
        [Route("All users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var allUsers = await _userRepository.GetAllUsersAsync();
            return allUsers.ErrorExist ? BadRequest(allUsers.ErrorMessage) : Ok(allUsers);
        }

        [HttpPatch]
        [Route("{userId:int}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SetStatus(int userId,
            [FromBody] UpdateUserStatusRequestDto updateUserStatusRequestDto)
        {
            var userStatus = await _userRepository.EditActiveStatusAsync(userId, updateUserStatusRequestDto);
            return userStatus.ErrorExist ? BadRequest(userStatus.ErrorMessage) : Ok(userStatus);
        }

        [HttpPost]
        [Route("{userId:int}/roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddAdmin(int userId)
        {
            var user = await _userRepository.SetAdminRoleAsync(userId);
            return user.ErrorExist ? BadRequest(user.ErrorMessage) : Ok(user);
        }

        [HttpPatch]
        [Route("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetUserPasswordDto resetUserPasswordDto)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized(new ApplicationResponseModel<string>
                {
                    Data = null,
                    ErrorExist = true,
                    ErrorMessage = "Invalid or missing user ID"
                });
            }
            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            var resetPassword = await _userRepository.ResetPasswordAsync(userId.ToString(), resetUserPasswordDto);
            if (resetPassword.ErrorExist)
            {
                return BadRequest(resetPassword); 
            }

            return Ok(resetPassword);
        }

        [HttpPost]
        [Route("RegisterAdmin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterRequestDto registerRequestDto)
        {
            var registerUser = await _userRepository.RegisterAdminAsync(registerRequestDto);

            if (registerUser.ErrorExist)
            {
                return BadRequest(registerUser.ErrorMessage);
            }
            
            return Ok(registerUser);
        }
        
        [Authorize]
        [HttpGet("userinfo")]
        public async Task<IActionResult> GetCurrentUser()
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized(new ApplicationResponseModel<string>
                {
                    Data = null,
                    ErrorExist = true,
                    ErrorMessage = "Invalid or missing user ID"
                });
            }

            var result = await _userRepository.GetUserByIdAsync(userId);
            if (result.ErrorExist)
                return NotFound(result);

            return Ok(result);
        }
    }
}