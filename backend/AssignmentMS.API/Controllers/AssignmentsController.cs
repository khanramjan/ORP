using System.Security.Claims;
using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Enums;
using AssignmentMS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly ISubmissionService _submissionService;

    public AssignmentsController(IAssignmentService assignmentService, ISubmissionService submissionService)
    {
        _assignmentService = assignmentService;
        _submissionService = submissionService;
    }

    [HttpGet]
    [Authorize(Policy = "TeacherOrAdmin")]
    public async Task<IActionResult> GetAssignments(
        [FromQuery] Guid? classId,
        [FromQuery] Guid? subjectId,
        [FromQuery] Guid? teacherId,
        [FromQuery] AssignmentStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _assignmentService.GetAssignmentsAsync(classId, subjectId, teacherId, status, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAssignmentById(Guid id)
    {
        var assignment = await _assignmentService.GetAssignmentByIdAsync(id);
        if (assignment == null) return NotFound();
        return Ok(assignment);
    }

    [HttpPost]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
    {
        var teacherIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(teacherIdStr, out var teacherId)) return Unauthorized();

        var assignment = await _assignmentService.CreateAssignmentAsync(teacherId, dto);
        return CreatedAtAction(nameof(GetAssignmentById), new { id = assignment.Id }, assignment);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentDto dto)
    {
        var teacherIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(teacherIdStr, out var teacherId)) return Unauthorized();

        var assignment = await _assignmentService.UpdateAssignmentAsync(id, teacherId, dto);
        if (assignment == null) return NotFound();
        return Ok(assignment);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "TeacherOrAdmin")]
    public async Task<IActionResult> DeleteAssignment(Guid id)
    {
        var success = await _assignmentService.DeleteAssignmentAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("{id}/publish")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> TogglePublishStatus(Guid id)
    {
        var teacherIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(teacherIdStr, out var teacherId)) return Unauthorized();

        var success = await _assignmentService.TogglePublishStatusAsync(id, teacherId);
        if (!success) return NotFound();
        return Ok(new { message = "Assignment status toggled" });
    }

    [HttpGet("{id}/submissions")]
    [Authorize(Policy = "TeacherOrAdmin")]
    public async Task<IActionResult> GetAssignmentSubmissions(Guid id)
    {
        var submissions = await _submissionService.GetSubmissionsByAssignmentIdAsync(id);
        return Ok(submissions);
    }
}
