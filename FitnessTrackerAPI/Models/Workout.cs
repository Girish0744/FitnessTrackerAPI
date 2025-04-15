using System;
using System.ComponentModel.DataAnnotations;

namespace FitnessTrackerAPI.Models
{
    public class Workout
    {
        public int Id { get; set; }

        public int DurationMinutes { get; set; }

        public int CaloriesBurned { get; set; }

        public int HeartRate { get; set; }

        public DateTime? Date { get; set; }

        public int ExerciseTypeId { get; set; } // Foreign key

        public ExerciseType ExerciseType { get; set; } // Navigation property

        public int UserId { get; set; }

        public User User { get; set; }
    }
}
