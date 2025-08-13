using System.Security.Claims;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers
{
    
[Route("api/[controller]")]
[ApiController]
[Authorize]

public class UserProfileController: ControllerBase
{

    private readonly IUserProfileRepository _userProfileRepository;

    public UserProfileController(IUserProfileRepository userProfileRepository)
    {
        _userProfileRepository = userProfileRepository;
    }

    [HttpPost]
    [Route("CreateOrUpdate")]
    public async Task<IActionResult> CreateOrUpdate([FromBody] UserProfileRequestDto userProfileRequestDto)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized();
        
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        if (userProfileRequestDto.DateOfBirth > today)
            return BadRequest(new { message = "DateOfBirth cannot be in the future." });

        var age = today.Year - userProfileRequestDto.DateOfBirth.Year - (today < userProfileRequestDto.DateOfBirth.AddYears(today.Year - userProfileRequestDto.DateOfBirth.Year) ? 1 : 0);
        if (age is < 18 or > 100)
            return BadRequest(new { message = "Age must be between 18 and 100." });

        var result = await _userProfileRepository.CreateOrUpdateAsync(userId, userProfileRequestDto);
        return result.ErrorExist ? BadRequest(result) : Ok(result);
    }
    
    [HttpGet]
    [Route("Get")]
    public async Task<IActionResult> Get()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized();

        var result = await _userProfileRepository.GetAsync(userId);
        return result.ErrorExist ? NotFound(result) : Ok(result);
    }
}
}