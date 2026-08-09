namespace AssignmentMS.Core.DTOs;

public class ClassDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public int SubjectCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateClassDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class AssignStudentDto
{
    public Guid StudentId { get; set; }
}
