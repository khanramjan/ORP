using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Enums;
using AssignmentMS.Core.Interfaces;
using AssignmentMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentMS.Infrastructure.Services;

public class SubmissionService : ISubmissionService
{
    private readonly ApplicationDbContext _context;

    public SubmissionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SubmissionDto?> GetSubmissionByIdAsync(Guid id)
    {
        var s = await _context.Submissions
            .Include(x => x.Assignment)
            .Include(x => x.Student)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (s == null) return null;
        return MapToDto(s);
    }

    public async Task<List<SubmissionDto>> GetSubmissionsByAssignmentIdAsync(Guid assignmentId)
    {
        return await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Where(s => s.AssignmentId == assignmentId)
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => MapToDto(s))
            .ToListAsync();
    }

    public async Task<List<SubmissionDto>> GetSubmissionsByStudentIdAsync(Guid studentId)
    {
        return await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Where(s => s.StudentId == studentId)
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => MapToDto(s))
            .ToListAsync();
    }

    public async Task<SubmissionDto?> GetStudentSubmissionForAssignmentAsync(Guid assignmentId, Guid studentId)
    {
        var s = await _context.Submissions
            .Include(x => x.Assignment)
            .Include(x => x.Student)
            .FirstOrDefaultAsync(x => x.AssignmentId == assignmentId && x.StudentId == studentId);

        if (s == null) return null;
        return MapToDto(s);
    }

    public async Task<SubmissionDto> CreateSubmissionAsync(Guid studentId, CreateSubmissionDto dto)
    {
        var assignment = await _context.Assignments.FindAsync(dto.AssignmentId)
            ?? throw new InvalidOperationException("Assignment not found");

        if (assignment.Status != AssignmentStatus.Published)
        {
            throw new InvalidOperationException("Cannot submit to an unpublished assignment");
        }

        var now = DateTime.UtcNow;
        if (now > assignment.Deadline && !assignment.AllowLateSubmission)
        {
            throw new InvalidOperationException("Deadline has passed and late submissions are not allowed for this assignment");
        }

        // Check if student already submitted
        var existing = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId);

        if (existing != null)
        {
            throw new InvalidOperationException("You have already submitted for this assignment. Please update your existing submission instead.");
        }

        var entity = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = dto.AssignmentId,
            StudentId = studentId,
            AnswerText = dto.AnswerText,
            AttachmentUrl = dto.AttachmentUrl,
            Status = SubmissionStatus.Submitted,
            SubmittedAt = now,
            UpdatedAt = now
        };

        _context.Submissions.Add(entity);
        await _context.SaveChangesAsync();

        return (await GetSubmissionByIdAsync(entity.Id))!;
    }

    public async Task<SubmissionDto?> UpdateSubmissionAsync(Guid submissionId, Guid studentId, CreateSubmissionDto dto)
    {
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == submissionId && s.StudentId == studentId);

        if (submission == null) return null;

        var now = DateTime.UtcNow;
        if (now > submission.Assignment.Deadline && !submission.Assignment.AllowLateSubmission)
        {
            throw new InvalidOperationException("Deadline has passed. Updates are no longer allowed.");
        }

        if (submission.Status == SubmissionStatus.Reviewed)
        {
            throw new InvalidOperationException("This submission has already been reviewed by the teacher and cannot be modified.");
        }

        submission.AnswerText = dto.AnswerText;
        submission.AttachmentUrl = dto.AttachmentUrl;
        submission.UpdatedAt = now;

        await _context.SaveChangesAsync();

        return await GetSubmissionByIdAsync(submissionId);
    }

    public async Task<SubmissionDto?> ReviewSubmissionAsync(Guid submissionId, ReviewSubmissionDto dto)
    {
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null) return null;

        if (dto.Marks > submission.Assignment.MaxMarks)
        {
            throw new InvalidOperationException($"Marks ({dto.Marks}) cannot exceed maximum allowed marks ({submission.Assignment.MaxMarks})");
        }

        submission.Marks = dto.Marks;
        submission.Feedback = dto.Feedback;
        submission.Status = dto.Status;
        submission.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetSubmissionByIdAsync(submissionId);
    }

    private static SubmissionDto MapToDto(Submission s)
    {
        return new SubmissionDto
        {
            Id = s.Id,
            AssignmentId = s.AssignmentId,
            AssignmentTitle = s.Assignment?.Title ?? string.Empty,
            MaxMarks = s.Assignment?.MaxMarks ?? 100,
            Deadline = s.Assignment?.Deadline ?? DateTime.MinValue,
            StudentId = s.StudentId,
            StudentName = s.Student?.FullName ?? string.Empty,
            StudentEmail = s.Student?.Email ?? string.Empty,
            AnswerText = s.AnswerText,
            AttachmentUrl = s.AttachmentUrl,
            Status = s.Status,
            Marks = s.Marks,
            Feedback = s.Feedback,
            SubmittedAt = s.SubmittedAt,
            UpdatedAt = s.UpdatedAt,
            IsLate = s.SubmittedAt > (s.Assignment?.Deadline ?? DateTime.MaxValue)
        };
    }
}
