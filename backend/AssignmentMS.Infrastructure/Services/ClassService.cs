using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Interfaces;
using AssignmentMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentMS.Infrastructure.Services;

public class ClassService : IClassService
{
    private readonly ApplicationDbContext _context;

    public ClassService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClassDto>> GetAllClassesAsync()
    {
        return await _context.Classes
            .Select(c => new ClassDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                StudentCount = c.StudentClasses.Count,
                SubjectCount = c.Subjects.Count,
                CreatedAt = c.CreatedAt
            })
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<ClassDto?> GetClassByIdAsync(Guid id)
    {
        var c = await _context.Classes
            .Include(x => x.StudentClasses)
            .Include(x => x.Subjects)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (c == null) return null;

        return new ClassDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            StudentCount = c.StudentClasses.Count,
            SubjectCount = c.Subjects.Count,
            CreatedAt = c.CreatedAt
        };
    }

    public async Task<ClassDto> CreateClassAsync(CreateClassDto dto)
    {
        var entity = new Class
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.Classes.Add(entity);
        await _context.SaveChangesAsync();

        return new ClassDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            StudentCount = 0,
            SubjectCount = 0,
            CreatedAt = entity.CreatedAt
        };
    }

    public async Task<ClassDto?> UpdateClassAsync(Guid id, CreateClassDto dto)
    {
        var entity = await _context.Classes
            .Include(c => c.StudentClasses)
            .Include(c => c.Subjects)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (entity == null) return null;

        entity.Name = dto.Name;
        entity.Description = dto.Description;

        await _context.SaveChangesAsync();

        return new ClassDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            StudentCount = entity.StudentClasses.Count,
            SubjectCount = entity.Subjects.Count,
            CreatedAt = entity.CreatedAt
        };
    }

    public async Task<bool> DeleteClassAsync(Guid id)
    {
        var entity = await _context.Classes.FindAsync(id);
        if (entity == null) return false;

        _context.Classes.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignStudentAsync(Guid classId, Guid studentId)
    {
        var exists = await _context.StudentClasses.AnyAsync(sc => sc.ClassId == classId && sc.StudentId == studentId);
        if (exists) return true;

        var sc = new StudentClass
        {
            Id = Guid.NewGuid(),
            ClassId = classId,
            StudentId = studentId,
            EnrolledAt = DateTime.UtcNow
        };

        _context.StudentClasses.Add(sc);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveStudentAsync(Guid classId, Guid studentId)
    {
        var sc = await _context.StudentClasses.FirstOrDefaultAsync(x => x.ClassId == classId && x.StudentId == studentId);
        if (sc == null) return false;

        _context.StudentClasses.Remove(sc);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<UserDto>> GetStudentsInClassAsync(Guid classId)
    {
        return await _context.StudentClasses
            .Where(sc => sc.ClassId == classId)
            .Select(sc => new UserDto
            {
                Id = sc.Student.Id,
                Email = sc.Student.Email,
                FullName = sc.Student.FullName,
                Role = sc.Student.Role,
                CreatedAt = sc.Student.CreatedAt
            })
            .ToListAsync();
    }
}
