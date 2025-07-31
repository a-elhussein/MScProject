using Backend.API.Models.DTO;
using Backend.API.WebUtility;
using Backend.Core.Auth;
using Backend.Core.Models.Domain;
using Backend.Core.Repositories;
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
        
        
    }
}