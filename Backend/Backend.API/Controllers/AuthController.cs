using Backend.API.Models.DTO;
using Backend.API.WebUtility;
using Backend.Core.Models.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public AuthController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }
        
        
        
        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequestDto)
        {
            var applicationUser = new ApplicationUser
            {
                UserName = registerRequestDto.Username,
                Email = registerRequestDto.Email,
                IsActive = IsActive.Active,
                IsDeleted = IsDeleted.NotDeleted
            };
            
            var identityResult = await _userManager.CreateAsync(applicationUser, registerRequestDto.Password);

            if (identityResult.Succeeded)
            {
                identityResult = await _userManager.AddToRoleAsync(applicationUser, "User");

                if (identityResult.Succeeded)
                {
                    return Ok("User created successfully!");
                }
            }
            
            return BadRequest("Something went wrong!");
        }
    }
}