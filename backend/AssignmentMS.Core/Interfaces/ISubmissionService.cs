using AssignmentMS.Core.DTOs;

namespace AssignmentMS.Core.Interfaces;

public interface ISubmissionService
{
    Task<SubmissionDto?> GetSubmissionByIdAsync(Guid id);
    Task<List<SubmissionDto>> GetSubmissionsByAssignmentIdAsync(Guid assignmentId);
    Task<List<SubmissionDto>> GetSubmissionsByStudentIdAsync(Guid studentId);
    Task<SubmissionDto?> GetStudentSubmissionForAssignmentAsync(Guid assignmentId, Guid studentId);
    Task<SubmissionDto> CreateSubmissionAsync(Guid studentId, CreateSubmissionDto dto);
    Task<SubmissionDto?> UpdateSubmissionAsync(Guid submissionId, Guid studentId, CreateSubmissionDto dto);
    Task<SubmissionDto?> ReviewSubmissionAsync(Guid submissionId, ReviewSubmissionDto dto);
}
