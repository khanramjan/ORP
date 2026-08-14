using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Enums;
using AssignmentMS.Infrastructure.Data;
using AssignmentMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AssignmentMS.Tests.Services;

public class ClassServiceTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateClassAsync_ValidDto_CreatesAndReturnsClass()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new ClassService(context);

        var dto = new CreateClassDto
        {
            Name = "Grade 10 - Section A",
            Description = "Tenth Grade Standard Section"
        };

        // Act
        var result = await service.CreateClassAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Grade 10 - Section A", result.Name);
        Assert.Equal("Tenth Grade Standard Section", result.Description);
        Assert.Equal(0, result.StudentCount);
    }

    [Fact]
    public async Task AssignStudentAsync_EnrollsStudentInClass()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var classEntity = new Class { Id = Guid.NewGuid(), Name = "Class 1" };
        var student = new User { Id = Guid.NewGuid(), Email = "s1@school.com", FullName = "Student 1", Role = UserRole.Student };

        context.Classes.Add(classEntity);
        context.Users.Add(student);
        await context.SaveChangesAsync();

        var service = new ClassService(context);

        // Act
        var assigned = await service.AssignStudentAsync(classEntity.Id, student.Id);
        var students = await service.GetStudentsInClassAsync(classEntity.Id);

        // Assert
        Assert.True(assigned);
        Assert.Single(students);
        Assert.Equal("s1@school.com", students[0].Email);
    }

    [Fact]
    public async Task RemoveStudentAsync_RemovesStudentFromClass()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var classId = Guid.NewGuid();
        var studentId = Guid.NewGuid();

        context.StudentClasses.Add(new StudentClass { Id = Guid.NewGuid(), ClassId = classId, StudentId = studentId });
        await context.SaveChangesAsync();

        var service = new ClassService(context);

        // Act
        var removed = await service.RemoveStudentAsync(classId, studentId);
        var students = await service.GetStudentsInClassAsync(classId);

        // Assert
        Assert.True(removed);
        Assert.Empty(students);
    }
}
