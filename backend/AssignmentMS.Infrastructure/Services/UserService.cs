using AssignmentMS.Core.DTOs;
using AssignmentMS.Core.Enums;
using AssignmentMS.Core.Interfaces;
using AssignmentMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentMS.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResponse<UserDto>> GetAllUsersAsync(UserRole? role, int page = 1, int pageSize = 10)
    {
        var query = _context.Users.AsQueryable();

        if (role.HasValue)
        {
            query = query.Where(u => u.Role == role.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResponse<UserDto>(items, total, page, pageSize);
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        var u = await _context.Users.FindAsync(id);
        if (u == null) return null;

        return new UserDto
        {
            Id = u.Id,
            Email = u.Email,
            FullName = u.FullName,
            Role = u.Role,
            CreatedAt = u.CreatedAt
        };
    }

    public async Task<UserDto?> UpdateUserAsync(Guid id, string fullName, UserRole role)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;

        user.FullName = fullName;
        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }
}
