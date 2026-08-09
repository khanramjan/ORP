using AssignmentMS.Core.Enums;

namespace AssignmentMS.Core.DTOs;

public class AssignmentDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public Guid CreatedByTeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public int MaxMarks { get; set; }
    public DateTime Deadline { get; set; }
    public AssignmentStatus Status { get; set; }
    public bool AllowLateSubmission { get; set; }
    public int TotalSubmissions { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateAssignmentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public Guid ClassId { get; set; }
    public int MaxMarks { get; set; } = 100;
    public DateTime Deadline { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    public bool AllowLateSubmission { get; set; } = false;
}

public class UpdateAssignmentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int MaxMarks { get; set; }
    public DateTime Deadline { get; set; }
    public AssignmentStatus Status { get; set; }
    public bool AllowLateSubmission { get; set; }
}
