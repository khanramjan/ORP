using AssignmentMS.Core.DTOs;

namespace AssignmentMS.Core.Interfaces;

public interface IClassService
{
    Task<List<ClassDto>> GetAllClassesAsync();
    Task<ClassDto?> GetClassByIdAsync(Guid id);
    Task<ClassDto> CreateClassAsync(CreateClassDto dto);
    Task<ClassDto?> UpdateClassAsync(Guid id, CreateClassDto dto);
    Task<bool> DeleteClassAsync(Guid id);
    Task<bool> AssignStudentAsync(Guid classId, Guid studentId);
    Task<bool> RemoveStudentAsync(Guid classId, Guid studentId);
    Task<List<UserDto>> GetStudentsInClassAsync(Guid classId);
}
