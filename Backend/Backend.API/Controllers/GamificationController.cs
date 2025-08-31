using System.Security.Claims;
using Backend.Core.Services;
using Backend.Core.WebUtility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]


public class GamificationController: ControllerBase
{
    private readonly IGamificationService _gamificationService;

    public GamificationController(IGamificationService gamificationService)
    {
        _gamificationService = gamificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetGamification()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(new ApplicationResponseModel<string> { ErrorExist = true, ErrorMessage = "Invalid or missing user ID" });

        var result = await _gamificationService.GetByUserIdAsync(userId);
        return Ok(result);
    }
    
}
}