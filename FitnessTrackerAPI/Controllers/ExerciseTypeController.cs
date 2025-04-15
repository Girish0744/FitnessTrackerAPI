using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FitnessTrackerAPI.Data;
using FitnessTrackerAPI.Models;
using FitnessTrackerAPI.DTOs;
using System.Collections.Generic;
using System.Linq;

namespace FitnessTrackerAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExerciseTypeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExerciseTypeController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<ExerciseType>> GetAll()
        {
            return Ok(_context.ExerciseTypes.ToList());
        }

        [HttpPost]
        public IActionResult Create(CreateExerciseTypeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var type = new ExerciseType
            {
                ShortCode = dto.ShortCode,
                Name = dto.Name
            };

            _context.ExerciseTypes.Add(type);
            _context.SaveChanges();
            return Ok(type);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, ExerciseType type)
        {
            var existing = _context.ExerciseTypes.FirstOrDefault(e => e.Id == id);
            if (existing == null) return NotFound();

            existing.ShortCode = type.ShortCode;
            existing.Name = type.Name;
            _context.SaveChanges();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var type = _context.ExerciseTypes.FirstOrDefault(e => e.Id == id);
            if (type == null) return NotFound();

            _context.ExerciseTypes.Remove(type);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
