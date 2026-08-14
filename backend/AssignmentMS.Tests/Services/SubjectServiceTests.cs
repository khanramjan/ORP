using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Enums;
using AssignmentMS.Infrastructure.Data;
using AssignmentMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AssignmentMS.Tests.Services;

public class SubjectServiceTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateSubjectAsync_ValidDto_CreatesAndReturnsSubject()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var classEntity = new Class { Id = Guid.NewGuid(), Name = "Class 10" };
        context.Classes.Add(classEntity);
        await context.SaveChangesAsync();

        var service = new SubjectService(context);

        var dto = new CreateSubjectDto
        {
            Name = "Mathematics",
            Code = "MATH101",
            ClassId = classEntity.Id
        };

        // Act
        var result = await service.CreateSubjectAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Mathematics", result.Name);
        Assert.Equal("MATH101", result.Code);
        Assert.Equal("Class 10", result.ClassName);
    }

    [Fact]
    public async Task AssignTeacherAsync_AssignsTeacherToSubject()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var classEntity = new Class { Id = Guid.NewGuid(), Name = "Class 10" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Physics", Code = "PHY101", ClassId = classEntity.Id };
        var teacher = new User { Id = Guid.NewGuid(), Email = "teacher@school.com", FullName = "Prof. Newton", Role = UserRole.Teacher };

        context.Classes.Add(classEntity);
        context.Subjects.Add(subject);
        context.Users.Add(teacher);
        await context.SaveChangesAsync();

        var service = new SubjectService(context);

        // Act
        var assigned = await service.AssignTeacherAsync(subject.Id, teacher.Id);
        var subjectDto = await service.GetSubjectByIdAsync(subject.Id);

        // Assert
        Assert.True(assigned);
        Assert.NotNull(subjectDto);
        Assert.Single(subjectDto.AssignedTeachers);
        Assert.Equal("teacher@school.com", subjectDto.AssignedTeachers[0].Email);
    }

    [Fact]
    public async Task RemoveTeacherAsync_RemovesTeacherFromSubject()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var subjectId = Guid.NewGuid();
        var teacherId = Guid.NewGuid();

        context.TeacherSubjects.Add(new TeacherSubject { Id = Guid.NewGuid(), SubjectId = subjectId, TeacherId = teacherId });
        await context.SaveChangesAsync();

        var service = new SubjectService(context);

        // Act
        var removed = await service.RemoveTeacherAsync(subjectId, teacherId);

        // Assert
        Assert.True(removed);
    }
}
