using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentMS.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<StudentClass> StudentClasses => Set<StudentClass>();
    public DbSet<TeacherSubject> TeacherSubjects => Set<TeacherSubject>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User indexes and configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Role).HasConversion<string>();
        });

        // Class
        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasIndex(c => c.Name).IsUnique();
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
        });

        // Subject
        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.HasIndex(s => s.Code).IsUnique();
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.Code).IsRequired().HasMaxLength(20);

            entity.HasOne(s => s.Class)
                  .WithMany(c => c.Subjects)
                  .HasForeignKey(s => s.ClassId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // StudentClass (Many-to-Many join table)
        modelBuilder.Entity<StudentClass>(entity =>
        {
            entity.HasKey(sc => sc.Id);

            entity.HasOne(sc => sc.Student)
                  .WithMany(u => u.StudentClasses)
                  .HasForeignKey(sc => sc.StudentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(sc => sc.Class)
                  .WithMany(c => c.StudentClasses)
                  .HasForeignKey(sc => sc.ClassId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // TeacherSubject (Many-to-Many join table)
        modelBuilder.Entity<TeacherSubject>(entity =>
        {
            entity.HasKey(ts => ts.Id);

            entity.HasOne(ts => ts.Teacher)
                  .WithMany(u => u.TeacherSubjects)
                  .HasForeignKey(ts => ts.TeacherId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ts => ts.Subject)
                  .WithMany(s => s.TeacherSubjects)
                  .HasForeignKey(ts => ts.SubjectId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Assignment
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Title).IsRequired().HasMaxLength(200);
            entity.Property(a => a.Status).HasConversion<string>();

            entity.HasOne(a => a.Subject)
                  .WithMany(s => s.Assignments)
                  .HasForeignKey(a => a.SubjectId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.Class)
                  .WithMany(c => c.Assignments)
                  .HasForeignKey(a => a.ClassId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.CreatedByTeacher)
                  .WithMany(u => u.CreatedAssignments)
                  .HasForeignKey(a => a.CreatedByTeacherId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Submission
        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Status).HasConversion<string>();

            entity.HasOne(s => s.Assignment)
                  .WithMany(a => a.Submissions)
                  .HasForeignKey(s => s.AssignmentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(s => s.Student)
                  .WithMany(u => u.Submissions)
                  .HasForeignKey(s => s.StudentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed Initial Demo Data
        SeedInitialData(modelBuilder);
    }

    private static void SeedInitialData(ModelBuilder modelBuilder)
    {
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var teacherId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var studentId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        var class1Id = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var class2Id = Guid.Parse("55555555-5555-5555-5555-555555555555");

        var subject1Id = Guid.Parse("66666666-6666-6666-6666-666666666666");
        var subject2Id = Guid.Parse("77777777-7777-7777-7777-777777777777");

        var createdAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = adminId,
                Email = "admin@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FullName = "System Administrator",
                Role = UserRole.Admin,
                CreatedAt = createdAt,
                UpdatedAt = createdAt
            },
            new User
            {
                Id = teacherId,
                Email = "teacher@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher@123"),
                FullName = "Prof. John Doe",
                Role = UserRole.Teacher,
                CreatedAt = createdAt,
                UpdatedAt = createdAt
            },
            new User
            {
                Id = studentId,
                Email = "student@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                FullName = "Alice Smith",
                Role = UserRole.Student,
                CreatedAt = createdAt,
                UpdatedAt = createdAt
            }
        );

        modelBuilder.Entity<Class>().HasData(
            new Class
            {
                Id = class1Id,
                Name = "Class 10-A",
                Description = "Grade 10 Section A Science Stream",
                CreatedAt = createdAt
            },
            new Class
            {
                Id = class2Id,
                Name = "Class 10-B",
                Description = "Grade 10 Section B Commerce Stream",
                CreatedAt = createdAt
            }
        );

        modelBuilder.Entity<Subject>().HasData(
            new Subject
            {
                Id = subject1Id,
                Name = "Computer Science",
                Code = "CS101",
                ClassId = class1Id,
                CreatedAt = createdAt
            },
            new Subject
            {
                Id = subject2Id,
                Name = "Mathematics",
                Code = "MATH101",
                ClassId = class1Id,
                CreatedAt = createdAt
            }
        );

        modelBuilder.Entity<StudentClass>().HasData(
            new StudentClass
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
                StudentId = studentId,
                ClassId = class1Id,
                EnrolledAt = createdAt
            }
        );

        modelBuilder.Entity<TeacherSubject>().HasData(
            new TeacherSubject
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
                TeacherId = teacherId,
                SubjectId = subject1Id,
                AssignedAt = createdAt
            }
        );
    }
}
