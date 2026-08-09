using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.DTOs.Auth;

namespace AssignmentMS.Core.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    Task<UserDto?> RegisterAsync(RegisterRequestDto request);
    Task<UserDto?> GetUserByIdAsync(Guid id);
}
