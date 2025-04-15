using FitnessTrackerAPI.Data;
using FitnessTrackerAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;


namespace FitnessTrackerAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WorkoutController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkoutController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Workout/user/{userId}
        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetMyWorkouts()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var workouts = await _context.Workouts
                .Where(w => w.UserId == userId)
                .Include(w => w.ExerciseType) // <-- this ensures we load the name
                .ToListAsync();

            var results = workouts.Select(w => new
            {
                w.Id,
                ExerciseType = w.ExerciseType != null ? $"{w.ExerciseType.Name} ({w.ExerciseType.ShortCode})" : null,
                w.DurationMinutes,
                w.CaloriesBurned,
                w.HeartRate,
                w.Date
            });

            return Ok(results);
        }



        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateWorkout([FromBody] CreateWorkoutDto dto)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var workout = new Workout
            {
                ExerciseTypeId = dto.ExerciseTypeId,
                DurationMinutes = dto.DurationMinutes,
                CaloriesBurned = dto.CaloriesBurned,
                HeartRate = dto.HeartRate,
                Date = dto.Date,
                UserId = userId
            };

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            return Ok(workout);
        }





        // PUT: api/Workout/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateWorkout(int id, [FromBody] UpdateWorkoutDto dto)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var workout = await _context.Workouts.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (workout == null) return NotFound();

            workout.ExerciseTypeId = dto.ExerciseTypeId;
            workout.DurationMinutes = dto.DurationMinutes;
            workout.CaloriesBurned = dto.CaloriesBurned;
            workout.HeartRate = dto.HeartRate;
            workout.Date = dto.Date;

            await _context.SaveChangesAsync();

            return Ok(workout);
        }


        // DELETE: api/Workout/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkout(int id)
        {
            var workout = await _context.Workouts.FindAsync(id);

            if (workout == null)
                return NotFound();

            _context.Workouts.Remove(workout);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetWorkoutSummary()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var count = await _context.Workouts.CountAsync(w => w.UserId == userId);

            return Ok(new { total = count });
        }

    }
}
