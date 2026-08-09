using System.ComponentModel.DataAnnotations;
using AssignmentMS.Core.Enums;

namespace AssignmentMS.Core.DTOs.Auth;

public class RegisterRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }
}
