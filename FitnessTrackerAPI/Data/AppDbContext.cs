using FitnessTrackerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessTrackerAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Workout> Workouts { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<ExerciseType> ExerciseTypes { get; set; }

    }
}
