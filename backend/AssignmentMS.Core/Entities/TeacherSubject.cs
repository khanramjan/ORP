namespace AssignmentMS.Core.Entities;

public class TeacherSubject
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;
    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
