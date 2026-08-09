using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Enums;
using AssignmentMS.Core.Interfaces;
using AssignmentMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentMS.Infrastructure.Services;

public class AssignmentService : IAssignmentService
{
    private readonly ApplicationDbContext _context;

    public AssignmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResponse<AssignmentDto>> GetAssignmentsAsync(
        Guid? classId = null,
        Guid? subjectId = null,
        Guid? teacherId = null,
        AssignmentStatus? status = null,
        int page = 1,
        int pageSize = 10)
    {
        var query = _context.Assignments
            .Include(a => a.Subject)
            .Include(a => a.Class)
            .Include(a => a.CreatedByTeacher)
            .Include(a => a.Submissions)
            .AsQueryable();

        if (classId.HasValue) query = query.Where(a => a.ClassId == classId.Value);
        if (subjectId.HasValue) query = query.Where(a => a.SubjectId == subjectId.Value);
        if (teacherId.HasValue) query = query.Where(a => a.CreatedByTeacherId == teacherId.Value);
        if (status.HasValue) query = query.Where(a => a.Status == status.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => MapToDto(a))
            .ToListAsync();

        return new PaginatedResponse<AssignmentDto>(items, total, page, pageSize);
    }

    public async Task<List<AssignmentDto>> GetStudentAssignmentsAsync(Guid studentId)
    {
        // Get classes the student is enrolled in
        var classIds = await _context.StudentClasses
            .Where(sc => sc.StudentId == studentId)
            .Select(sc => sc.ClassId)
            .ToListAsync();

        var assignments = await _context.Assignments
            .Include(a => a.Subject)
            .Include(a => a.Class)
            .Include(a => a.CreatedByTeacher)
            .Include(a => a.Submissions)
            .Where(a => classIds.Contains(a.ClassId) && a.Status == AssignmentStatus.Published)
            .OrderBy(a => a.Deadline)
            .Select(a => MapToDto(a))
            .ToListAsync();

        return assignments;
    }

    public async Task<AssignmentDto?> GetAssignmentByIdAsync(Guid id)
    {
        var a = await _context.Assignments
            .Include(x => x.Subject)
            .Include(x => x.Class)
            .Include(x => x.CreatedByTeacher)
            .Include(x => x.Submissions)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a == null) return null;
        return MapToDto(a);
    }

    public async Task<AssignmentDto> CreateAssignmentAsync(Guid teacherId, CreateAssignmentDto dto)
    {
        var entity = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            SubjectId = dto.SubjectId,
            ClassId = dto.ClassId,
            CreatedByTeacherId = teacherId,
            MaxMarks = dto.MaxMarks,
            Deadline = dto.Deadline.ToUniversalTime(),
            Status = dto.Status,
            AllowLateSubmission = dto.AllowLateSubmission,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Assignments.Add(entity);
        await _context.SaveChangesAsync();

        return (await GetAssignmentByIdAsync(entity.Id))!;
    }

    public async Task<AssignmentDto?> UpdateAssignmentAsync(Guid id, Guid teacherId, UpdateAssignmentDto dto)
    {
        var entity = await _context.Assignments.FindAsync(id);
        if (entity == null) return null;

        entity.Title = dto.Title;
        entity.Description = dto.Description;
        entity.MaxMarks = dto.MaxMarks;
        entity.Deadline = dto.Deadline.ToUniversalTime();
        entity.Status = dto.Status;
        entity.AllowLateSubmission = dto.AllowLateSubmission;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetAssignmentByIdAsync(id);
    }

    public async Task<bool> DeleteAssignmentAsync(Guid id)
    {
        var entity = await _context.Assignments.FindAsync(id);
        if (entity == null) return false;

        _context.Assignments.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> TogglePublishStatusAsync(Guid id, Guid teacherId)
    {
        var entity = await _context.Assignments.FindAsync(id);
        if (entity == null) return false;

        entity.Status = entity.Status == AssignmentStatus.Draft ? AssignmentStatus.Published : AssignmentStatus.Draft;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    private static AssignmentDto MapToDto(Assignment a)
    {
        return new AssignmentDto
        {
            Id = a.Id,
            Title = a.Title,
            Description = a.Description,
            SubjectId = a.SubjectId,
            SubjectName = a.Subject?.Name ?? string.Empty,
            ClassId = a.ClassId,
            ClassName = a.Class?.Name ?? string.Empty,
            CreatedByTeacherId = a.CreatedByTeacherId,
            TeacherName = a.CreatedByTeacher?.FullName ?? string.Empty,
            MaxMarks = a.MaxMarks,
            Deadline = a.Deadline,
            Status = a.Status,
            AllowLateSubmission = a.AllowLateSubmission,
            TotalSubmissions = a.Submissions?.Count ?? 0,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        };
    }
}
