namespace AssignmentMS.Core.DTOs;

public class SubjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public List<UserDto> AssignedTeachers { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class CreateSubjectDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public Guid ClassId { get; set; }
}

public class AssignTeacherDto
{
    public Guid TeacherId { get; set; }
}
