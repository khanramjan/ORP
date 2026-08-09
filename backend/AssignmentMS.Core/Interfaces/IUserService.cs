using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Enums;

namespace AssignmentMS.Core.Interfaces;

public interface IUserService
{
    Task<PaginatedResponse<UserDto>> GetAllUsersAsync(UserRole? role, int page = 1, int pageSize = 10);
    Task<UserDto?> GetUserByIdAsync(Guid id);
    Task<UserDto?> UpdateUserAsync(Guid id, string fullName, UserRole role);
    Task<bool> DeleteUserAsync(Guid id);
}
