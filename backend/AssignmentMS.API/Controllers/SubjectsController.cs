using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _subjectService;

    public SubjectsController(ISubjectService subjectService)
    {
        _subjectService = subjectService;
    }

    [HttpGet]
    [Authorize(Policy = "TeacherOrAdmin")]
    public async Task<IActionResult> GetAllSubjects([FromQuery] Guid? classId)
    {
        var subjects = await _subjectService.GetAllSubjectsAsync(classId);
        return Ok(subjects);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "TeacherOrAdmin")]
    public async Task<IActionResult> GetSubjectById(Guid id)
    {
        var subject = await _subjectService.GetSubjectByIdAsync(id);
        if (subject == null) return NotFound();
        return Ok(subject);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectDto dto)
    {
        var subject = await _subjectService.CreateSubjectAsync(dto);
        return CreatedAtAction(nameof(GetSubjectById), new { id = subject.Id }, subject);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] CreateSubjectDto dto)
    {
        var subject = await _subjectService.UpdateSubjectAsync(id, dto);
        if (subject == null) return NotFound();
        return Ok(subject);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteSubject(Guid id)
    {
        var success = await _subjectService.DeleteSubjectAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/teachers")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> AssignTeacher(Guid id, [FromBody] AssignTeacherDto dto)
    {
        var success = await _subjectService.AssignTeacherAsync(id, dto.TeacherId);
        return Ok(new { success });
    }

    [HttpDelete("{subjectId}/teachers/{teacherId}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> RemoveTeacher(Guid subjectId, Guid teacherId)
    {
        var success = await _subjectService.RemoveTeacherAsync(subjectId, teacherId);
        if (!success) return NotFound();
        return NoContent();
    }
}
