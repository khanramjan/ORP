using AssignmentMS.Core.DTOs;

namespace AssignmentMS.Core.Interfaces;

public interface ISubjectService
{
    Task<List<SubjectDto>> GetAllSubjectsAsync(Guid? classId = null);
    Task<SubjectDto?> GetSubjectByIdAsync(Guid id);
    Task<SubjectDto> CreateSubjectAsync(CreateSubjectDto dto);
    Task<SubjectDto?> UpdateSubjectAsync(Guid id, CreateSubjectDto dto);
    Task<bool> DeleteSubjectAsync(Guid id);
    Task<bool> AssignTeacherAsync(Guid subjectId, Guid teacherId);
    Task<bool> RemoveTeacherAsync(Guid subjectId, Guid teacherId);
}
