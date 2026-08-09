using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Enums;

namespace AssignmentMS.Core.Interfaces;

public interface IAssignmentService
{
    Task<PaginatedResponse<AssignmentDto>> GetAssignmentsAsync(
        Guid? classId = null,
        Guid? subjectId = null,
        Guid? teacherId = null,
        AssignmentStatus? status = null,
        int page = 1,
        int pageSize = 10);

    Task<List<AssignmentDto>> GetStudentAssignmentsAsync(Guid studentId);
    Task<AssignmentDto?> GetAssignmentByIdAsync(Guid id);
    Task<AssignmentDto> CreateAssignmentAsync(Guid teacherId, CreateAssignmentDto dto);
    Task<AssignmentDto?> UpdateAssignmentAsync(Guid id, Guid teacherId, UpdateAssignmentDto dto);
    Task<bool> DeleteAssignmentAsync(Guid id);
    Task<bool> TogglePublishStatusAsync(Guid id, Guid teacherId);
}
