using System.ComponentModel.DataAnnotations;

namespace FitnessTrackerAPI.DTOs
{
    public class CreateExerciseTypeDto
    {
        [Required]
        public string ShortCode { get; set; }

        [Required]
        public string Name { get; set; }
    }
}
