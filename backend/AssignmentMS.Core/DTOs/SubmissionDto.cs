using AssignmentMS.Core.Enums;

namespace AssignmentMS.Core.DTOs;

public class SubmissionDto
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public string AssignmentTitle { get; set; } = string.Empty;
    public int MaxMarks { get; set; }
    public DateTime Deadline { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string AnswerText { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public SubmissionStatus Status { get; set; }
    public int? Marks { get; set; }
    public string? Feedback { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsLate { get; set; }
}

public class CreateSubmissionDto
{
    public Guid AssignmentId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
}

public class ReviewSubmissionDto
{
    public int Marks { get; set; }
    public string? Feedback { get; set; }
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Reviewed;
}
