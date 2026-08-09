using AssignmentMS.Core.Enums;

namespace AssignmentMS.Core.Entities;

public class Assignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public Guid ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public Guid CreatedByTeacherId { get; set; }
    public User CreatedByTeacher { get; set; } = null!;
    public int MaxMarks { get; set; } = 100;
    public DateTime Deadline { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    public bool AllowLateSubmission { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
