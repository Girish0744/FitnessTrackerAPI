using System.ComponentModel.DataAnnotations;

namespace FitnessTrackerAPI.Models
{
    public class Workout
    {
        [Key]
        public int Id { get; set; }


        public string? UserId { get; set; }

        [Required]
        public string ExerciseType { get; set; }

        public int DurationMinutes { get; set; }

        public int CaloriesBurned { get; set; }

        public int HeartRate { get; set; }

        public DateTime? Date { get; set; }

    }
}
