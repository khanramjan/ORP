using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Enums;
using AssignmentMS.Infrastructure.Data;
using AssignmentMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AssignmentMS.Tests.Services;

public class AssignmentServiceTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateAssignmentAsync_ValidDto_CreatesAssignment()
    {
        using var context = GetInMemoryDbContext();
        var teacherId = Guid.NewGuid();
        var classId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();

        context.Classes.Add(new Class { Id = classId, Name = "Class A" });
        context.Subjects.Add(new Subject { Id = subjectId, Name = "Physics", ClassId = classId });
        context.Users.Add(new User { Id = teacherId, FullName = "Dr. Newton", Role = UserRole.Teacher });
        await context.SaveChangesAsync();

        var service = new AssignmentService(context);

        var dto = new CreateAssignmentDto
        {
            Title = "Kinematics Quiz",
            Description = "Chapter 1-3",
            ClassId = classId,
            SubjectId = subjectId,
            MaxMarks = 50,
            Deadline = DateTime.UtcNow.AddDays(5),
            Status = AssignmentStatus.Draft
        };

        var result = await service.CreateAssignmentAsync(teacherId, dto);

        Assert.NotNull(result);
        Assert.Equal("Kinematics Quiz", result.Title);
        Assert.Equal(AssignmentStatus.Draft, result.Status);
    }

    [Fact]
    public async Task TogglePublishStatusAsync_TogglesBetweenDraftAndPublished()
    {
        using var context = GetInMemoryDbContext();
        var teacherId = Guid.NewGuid();
        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Draft Assignment",
            Status = AssignmentStatus.Draft,
            CreatedByTeacherId = teacherId
        };
        context.Assignments.Add(assignment);
        await context.SaveChangesAsync();

        var service = new AssignmentService(context);

        var toggled = await service.TogglePublishStatusAsync(assignment.Id, teacherId);
        Assert.True(toggled);

        var updated = await service.GetAssignmentByIdAsync(assignment.Id);
        Assert.Equal(AssignmentStatus.Published, updated!.Status);
    }
}
