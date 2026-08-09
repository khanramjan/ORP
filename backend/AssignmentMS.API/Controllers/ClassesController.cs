using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;

    public ClassesController(IClassService classService)
    {
        _classService = classService;
    }

    [HttpGet]
    [Authorize(Policy = "TeacherOrAdmin")]
    public async Task<IActionResult> GetAllClasses()
    {
        var classes = await _classService.GetAllClassesAsync();
        return Ok(classes);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "TeacherOrAdmin")]
    public async Task<IActionResult> GetClassById(Guid id)
    {
        var cls = await _classService.GetClassByIdAsync(id);
        if (cls == null) return NotFound();
        return Ok(cls);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
    {
        var cls = await _classService.CreateClassAsync(dto);
        return CreatedAtAction(nameof(GetClassById), new { id = cls.Id }, cls);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateClass(Guid id, [FromBody] CreateClassDto dto)
    {
        var cls = await _classService.UpdateClassAsync(id, dto);
        if (cls == null) return NotFound();
        return Ok(cls);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteClass(Guid id)
    {
        var success = await _classService.DeleteClassAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/students")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> AssignStudent(Guid id, [FromBody] AssignStudentDto dto)
    {
        var success = await _classService.AssignStudentAsync(id, dto.StudentId);
        return Ok(new { success });
    }

    [HttpDelete("{classId}/students/{studentId}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> RemoveStudent(Guid classId, Guid studentId)
    {
        var success = await _classService.RemoveStudentAsync(classId, studentId);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpGet("{id}/students")]
    [Authorize(Policy = "TeacherOrAdmin")]
    public async Task<IActionResult> GetStudentsInClass(Guid id)
    {
        var students = await _classService.GetStudentsInClassAsync(id);
        return Ok(students);
    }
}
