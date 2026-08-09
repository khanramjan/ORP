using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Interfaces;
using AssignmentMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentMS.Infrastructure.Services;

public class SubjectService : ISubjectService
{
    private readonly ApplicationDbContext _context;

    public SubjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SubjectDto>> GetAllSubjectsAsync(Guid? classId = null)
    {
        var query = _context.Subjects
            .Include(s => s.Class)
            .Include(s => s.TeacherSubjects)
                .ThenInclude(ts => ts.Teacher)
            .AsQueryable();

        if (classId.HasValue)
        {
            query = query.Where(s => s.ClassId == classId.Value);
        }

        return await query.Select(s => new SubjectDto
        {
            Id = s.Id,
            Name = s.Name,
            Code = s.Code,
            ClassId = s.ClassId,
            ClassName = s.Class.Name,
            AssignedTeachers = s.TeacherSubjects.Select(ts => new UserDto
            {
                Id = ts.Teacher.Id,
                Email = ts.Teacher.Email,
                FullName = ts.Teacher.FullName,
                Role = ts.Teacher.Role,
                CreatedAt = ts.Teacher.CreatedAt
            }).ToList(),
            CreatedAt = s.CreatedAt
        }).ToListAsync();
    }

    public async Task<SubjectDto?> GetSubjectByIdAsync(Guid id)
    {
        var s = await _context.Subjects
            .Include(x => x.Class)
            .Include(x => x.TeacherSubjects)
                .ThenInclude(ts => ts.Teacher)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (s == null) return null;

        return new SubjectDto
        {
            Id = s.Id,
            Name = s.Name,
            Code = s.Code,
            ClassId = s.ClassId,
            ClassName = s.Class.Name,
            AssignedTeachers = s.TeacherSubjects.Select(ts => new UserDto
            {
                Id = ts.Teacher.Id,
                Email = ts.Teacher.Email,
                FullName = ts.Teacher.FullName,
                Role = ts.Teacher.Role,
                CreatedAt = ts.Teacher.CreatedAt
            }).ToList(),
            CreatedAt = s.CreatedAt
        };
    }

    public async Task<SubjectDto> CreateSubjectAsync(CreateSubjectDto dto)
    {
        var cls = await _context.Classes.FindAsync(dto.ClassId)
            ?? throw new InvalidOperationException("Class not found");

        var entity = new Subject
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Code = dto.Code,
            ClassId = dto.ClassId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Subjects.Add(entity);
        await _context.SaveChangesAsync();

        return new SubjectDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            ClassId = entity.ClassId,
            ClassName = cls.Name,
            AssignedTeachers = new List<UserDto>(),
            CreatedAt = entity.CreatedAt
        };
    }

    public async Task<SubjectDto?> UpdateSubjectAsync(Guid id, CreateSubjectDto dto)
    {
        var s = await _context.Subjects
            .Include(x => x.Class)
            .Include(x => x.TeacherSubjects)
                .ThenInclude(ts => ts.Teacher)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (s == null) return null;

        s.Name = dto.Name;
        s.Code = dto.Code;
        s.ClassId = dto.ClassId;

        await _context.SaveChangesAsync();

        var cls = await _context.Classes.FindAsync(dto.ClassId);

        return new SubjectDto
        {
            Id = s.Id,
            Name = s.Name,
            Code = s.Code,
            ClassId = s.ClassId,
            ClassName = cls?.Name ?? string.Empty,
            AssignedTeachers = s.TeacherSubjects.Select(ts => new UserDto
            {
                Id = ts.Teacher.Id,
                Email = ts.Teacher.Email,
                FullName = ts.Teacher.FullName,
                Role = ts.Teacher.Role,
                CreatedAt = ts.Teacher.CreatedAt
            }).ToList(),
            CreatedAt = s.CreatedAt
        };
    }

    public async Task<bool> DeleteSubjectAsync(Guid id)
    {
        var entity = await _context.Subjects.FindAsync(id);
        if (entity == null) return false;

        _context.Subjects.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignTeacherAsync(Guid subjectId, Guid teacherId)
    {
        var exists = await _context.TeacherSubjects.AnyAsync(ts => ts.SubjectId == subjectId && ts.TeacherId == teacherId);
        if (exists) return true;

        var ts = new TeacherSubject
        {
            Id = Guid.NewGuid(),
            SubjectId = subjectId,
            TeacherId = teacherId,
            AssignedAt = DateTime.UtcNow
        };

        _context.TeacherSubjects.Add(ts);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveTeacherAsync(Guid subjectId, Guid teacherId)
    {
        var ts = await _context.TeacherSubjects.FirstOrDefaultAsync(x => x.SubjectId == subjectId && x.TeacherId == teacherId);
        if (ts == null) return false;

        _context.TeacherSubjects.Remove(ts);
        await _context.SaveChangesAsync();
        return true;
    }
}
