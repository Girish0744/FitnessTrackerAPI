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
        public async Task<IActionResult> GetMyWorkouts()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);

            var workouts = await _context.Workouts
                .Where(w => w.UserId == userId.ToString())
                .ToListAsync();

            return Ok(workouts);
        }


        // POST: api/Workout
        [HttpPost]
        public async Task<IActionResult> CreateWorkout([FromBody] Workout workout)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join(" | ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage));

                return BadRequest("Model is invalid: " + errors);
            }

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            workout.UserId = userIdClaim.Value;

            if (workout.Date == null)
                workout.Date = DateTime.Now;

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyWorkouts), new { }, workout);
        }




        // PUT: api/Workout/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkout(int id, [FromBody] Workout updatedWorkout)
        {
            var workout = await _context.Workouts.FindAsync(id);

            if (workout == null)
                return NotFound();

            workout.ExerciseType = updatedWorkout.ExerciseType;
            workout.DurationMinutes = updatedWorkout.DurationMinutes;
            workout.CaloriesBurned = updatedWorkout.CaloriesBurned;
            workout.HeartRate = updatedWorkout.HeartRate;
            workout.Date = updatedWorkout.Date;

            await _context.SaveChangesAsync();

            return NoContent();
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
    }
}
