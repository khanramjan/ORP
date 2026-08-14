using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Enums;
using AssignmentMS.Infrastructure.Data;
using AssignmentMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AssignmentMS.Tests.Services;

public class SubmissionServiceTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateSubmissionAsync_BeforeDeadline_Succeeds()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var classId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Math Homework 1",
            Description = "Solve problems 1-10",
            ClassId = classId,
            SubjectId = subjectId,
            CreatedByTeacherId = teacherId,
            Deadline = DateTime.UtcNow.AddDays(2),
            Status = AssignmentStatus.Published,
            AllowLateSubmission = false,
            MaxMarks = 100
        };

        context.Assignments.Add(assignment);
        context.Users.Add(new User { Id = studentId, Email = "student@test.com", FullName = "Test Student", Role = UserRole.Student });
        await context.SaveChangesAsync();

        var service = new SubmissionService(context);

        // Act
        var result = await service.CreateSubmissionAsync(studentId, new CreateSubmissionDto
        {
            AssignmentId = assignment.Id,
            AnswerText = "Here are my answers..."
        });

        // Assert
        Assert.NotNull(result);
        Assert.Equal(assignment.Id, result.AssignmentId);
        Assert.Equal(SubmissionStatus.Submitted, result.Status);
    }

    [Fact]
    public async Task CreateSubmissionAsync_AfterDeadlineWithoutLateAllowed_ThrowsException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Overdue Assignment",
            Description = "Too late",
            Deadline = DateTime.UtcNow.AddHours(-2), // 2 hours in the past
            Status = AssignmentStatus.Published,
            AllowLateSubmission = false,
            MaxMarks = 100
        };

        context.Assignments.Add(assignment);
        await context.SaveChangesAsync();

        var service = new SubmissionService(context);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateSubmissionAsync(studentId, new CreateSubmissionDto
            {
                AssignmentId = assignment.Id,
                AnswerText = "Late answer"
            }));

        Assert.Contains("Deadline has passed", ex.Message);
    }

    [Fact]
    public async Task ReviewSubmissionAsync_ExceedingMaxMarks_ThrowsException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var studentId = Guid.NewGuid();
        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Quiz 1",
            MaxMarks = 50
        };
        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            Assignment = assignment,
            StudentId = studentId,
            AnswerText = "My answer",
            Status = SubmissionStatus.Submitted
        };

        context.Assignments.Add(assignment);
        context.Submissions.Add(submission);
        await context.SaveChangesAsync();

        var service = new SubmissionService(context);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.ReviewSubmissionAsync(submission.Id, new ReviewSubmissionDto
            {
                Marks = 60, // Exceeds 50
                Feedback = "Good effort",
                Status = SubmissionStatus.Reviewed
            }));

        Assert.Contains("cannot exceed maximum allowed marks", ex.Message);
    }

    [Fact]
    public async Task ReviewSubmissionAsync_ValidMarks_UpdatesStatusAndMarks()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var studentId = Guid.NewGuid();
        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Quiz 1",
            MaxMarks = 100
        };
        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            Assignment = assignment,
            StudentId = studentId,
            AnswerText = "My answer",
            Status = SubmissionStatus.Submitted
        };

        context.Assignments.Add(assignment);
        context.Submissions.Add(submission);
        context.Users.Add(new User { Id = studentId, Email = "student@test.com", FullName = "Test Student", Role = UserRole.Student });
        await context.SaveChangesAsync();

        var service = new SubmissionService(context);

        // Act
        var result = await service.ReviewSubmissionAsync(submission.Id, new ReviewSubmissionDto
        {
            Marks = 95,
            Feedback = "Excellent solution!",
            Status = SubmissionStatus.Reviewed
        });

        // Assert
        Assert.NotNull(result);
        Assert.Equal(95, result.Marks);
        Assert.Equal("Excellent solution!", result.Feedback);
        Assert.Equal(SubmissionStatus.Reviewed, result.Status);
    }
}
