using System.Security.Claims;
using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _submissionService;

    public SubmissionsController(ISubmissionService submissionService)
    {
        _submissionService = submissionService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSubmissionById(Guid id)
    {
        var submission = await _submissionService.GetSubmissionByIdAsync(id);
        if (submission == null) return NotFound();
        return Ok(submission);
    }

    [HttpGet("my")]
    [Authorize(Policy = "StudentOnly")]
    public async Task<IActionResult> GetMySubmissions()
    {
        var studentIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(studentIdStr, out var studentId)) return Unauthorized();

        var submissions = await _submissionService.GetSubmissionsByStudentIdAsync(studentId);
        return Ok(submissions);
    }

    [HttpPost]
    [Authorize(Policy = "StudentOnly")]
    public async Task<IActionResult> CreateSubmission([FromBody] CreateSubmissionDto dto)
    {
        var studentIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(studentIdStr, out var studentId)) return Unauthorized();

        try
        {
            var submission = await _submissionService.CreateSubmissionAsync(studentId, dto);
            return CreatedAtAction(nameof(GetSubmissionById), new { id = submission.Id }, submission);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "StudentOnly")]
    public async Task<IActionResult> UpdateSubmission(Guid id, [FromBody] CreateSubmissionDto dto)
    {
        var studentIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(studentIdStr, out var studentId)) return Unauthorized();

        try
        {
            var submission = await _submissionService.UpdateSubmissionAsync(id, studentId, dto);
            if (submission == null) return NotFound();
            return Ok(submission);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/review")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> ReviewSubmission(Guid id, [FromBody] ReviewSubmissionDto dto)
    {
        try
        {
            var submission = await _submissionService.ReviewSubmissionAsync(id, dto);
            if (submission == null) return NotFound();
            return Ok(submission);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
