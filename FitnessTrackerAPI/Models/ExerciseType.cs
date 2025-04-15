using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace FitnessTrackerAPI.Models
{
    public class ExerciseType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string ShortCode { get; set; }

        [Required]
        public string Name { get; set; }

        public List<Workout> Workouts { get; set; }
    }
}
