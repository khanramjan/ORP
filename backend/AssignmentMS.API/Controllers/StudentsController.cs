using System.Security.Claims;
using AssignmentMS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "StudentOnly")]
public class StudentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly ISubmissionService _submissionService;

    public StudentsController(IAssignmentService assignmentService, ISubmissionService submissionService)
    {
        _assignmentService = assignmentService;
        _submissionService = submissionService;
    }

    [HttpGet("assignments")]
    public async Task<IActionResult> GetMyAssignments()
    {
        var studentIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(studentIdStr, out var studentId)) return Unauthorized();

        var assignments = await _assignmentService.GetStudentAssignmentsAsync(studentId);
        return Ok(assignments);
    }

    [HttpGet("assignments/{id}")]
    public async Task<IActionResult> GetAssignmentDetail(Guid id)
    {
        var studentIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(studentIdStr, out var studentId)) return Unauthorized();

        var assignment = await _assignmentService.GetAssignmentByIdAsync(id);
        if (assignment == null) return NotFound();

        var submission = await _submissionService.GetStudentSubmissionForAssignmentAsync(id, studentId);

        return Ok(new
        {
            assignment,
            submission
        });
    }
}
