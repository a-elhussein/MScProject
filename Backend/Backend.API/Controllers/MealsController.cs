using System.Security.Claims;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.Services;
using Backend.Core.WebUtility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    
    public class MealsController : ControllerBase
    {
        private readonly IMealRepository _mealRepository;
        private readonly IOpenFoodFactsService _openFoodFactsService;

        public MealsController(IMealRepository  mealRepository, IOpenFoodFactsService  openFoodFactsService)
        {
            _mealRepository = mealRepository;
            _openFoodFactsService = openFoodFactsService;
        }

        [HttpPost]
        [Route("AddItem")]
        public async Task<IActionResult> AddItem([FromBody] AddMealItemRequestDto addMealItemRequestDto)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized(new ApplicationResponseModel<string> { ErrorExist = true, ErrorMessage = "Invalid or missing user ID" });

            if (string.IsNullOrWhiteSpace(addMealItemRequestDto.Barcode) || addMealItemRequestDto.Quantity <= 0)
                return BadRequest(new ApplicationResponseModel<string> { ErrorExist = true, ErrorMessage = "Invalid payload" });
            
            var refreshed = await _openFoodFactsService.RefreshFoodAsync(addMealItemRequestDto.Barcode);
            if (refreshed.ErrorExist || refreshed.Data is null)
                return BadRequest(new ApplicationResponseModel<string> { ErrorExist = true, ErrorMessage = refreshed.ErrorMessage ?? "Food not found." });
            
            var result = await _mealRepository.AddItemAsync(userId, addMealItemRequestDto);
            return result.ErrorExist ? BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("Totals")]
        public async Task<IActionResult> GetTotals([FromQuery] string? day)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized(new ApplicationResponseModel<string> { ErrorExist = true, ErrorMessage = "Invalid or missing user ID" });

            var result = await _mealRepository.GetDayTotalsAsync(userId, day);
            return result.ErrorExist ? BadRequest(result) : Ok(result);
        }

        [HttpGet]
        [Route("Items")]
        public async Task<IActionResult> GetItems([FromQuery] string? day)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized(new ApplicationResponseModel<string> { ErrorExist = true, ErrorMessage = "Invalid or missing user ID" });

            var result = await _mealRepository.GetDayItemsAsync(userId, day);
            return result.ErrorExist ? BadRequest(result) : Ok(result);
        }

        [HttpPatch]
        [Route("items/{mealItemId:int}")]
        public async Task<IActionResult> UpdateItem(int mealItemId, [FromBody] UpdateMealItemRequestDto updateMealItemRequestDto)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized(new ApplicationResponseModel<string> { ErrorExist = true, ErrorMessage = "Invalid or missing user ID" });
            
            var result = await _mealRepository.UpdateItemAsync(userId, mealItemId, updateMealItemRequestDto);
            return result.ErrorExist ? BadRequest(result) : Ok(result);
        }

        [HttpDelete]
        [Route("items/{mealItemId:int}")]
        public async Task<IActionResult> DeleteItem(int mealItemId)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized(new ApplicationResponseModel<string> { ErrorExist = true, ErrorMessage = "Invalid or missing user ID" });
            
            var result = await _mealRepository.DeleteItemAsync(userId, mealItemId);
            return result.ErrorExist ? BadRequest(result) : Ok("Deleted");
        }

        [HttpGet]
        [Route("userFoods")]
        public async Task<IActionResult> GetUserFoods([FromQuery] string? query, [FromQuery] int limit = 20)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized(new ApplicationResponseModel<string> { ErrorExist = true, ErrorMessage = "Invalid or missing user ID" });
            
            var result = await _mealRepository.FoodSearchAsync(userId, query, limit);
            return result.ErrorExist ? BadRequest(result) : Ok(result);
        }

    }
}