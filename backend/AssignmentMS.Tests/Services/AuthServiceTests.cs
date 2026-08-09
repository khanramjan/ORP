using AssignmentMS.Core.DTOs.Auth;
using AssignmentMS.Core.Entities;
using AssignmentMS.Core.Enums;
using AssignmentMS.Infrastructure.Data;
using AssignmentMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace AssignmentMS.Tests.Services;

public class AuthServiceTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);
        return context;
    }

    private IConfiguration GetConfiguration()
    {
        var inMemorySettings = new Dictionary<string, string?> {
            {"Jwt:Secret", "SuperSecretTestKeyForJwtTokenGeneration2026Requirement!"},
            {"Jwt:Issuer", "AssignmentMS.API"},
            {"Jwt:Audience", "AssignmentMS.Frontend"},
            {"Jwt:ExpiryInHours", "24"}
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsTokenAndUser()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var rawPassword = "TestPassword123!";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@school.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(rawPassword),
            FullName = "Test User",
            Role = UserRole.Teacher
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var service = new AuthService(context, GetConfiguration());

        // Act
        var result = await service.LoginAsync(new LoginRequestDto
        {
            Email = "test@school.com",
            Password = rawPassword
        });

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
        Assert.Equal(user.Email, result.Email);
        Assert.Equal(UserRole.Teacher, result.Role);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ReturnsNull()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@school.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword"),
            FullName = "Test User",
            Role = UserRole.Student
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var service = new AuthService(context, GetConfiguration());

        // Act
        var result = await service.LoginAsync(new LoginRequestDto
        {
            Email = "test@school.com",
            Password = "WrongPassword"
        });

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task RegisterAsync_WithNewEmail_CreatesUser()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new AuthService(context, GetConfiguration());

        var dto = new RegisterRequestDto
        {
            Email = "newstudent@school.com",
            Password = "StudentPass123",
            FullName = "New Student",
            Role = UserRole.Student
        };

        // Act
        var result = await service.RegisterAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("newstudent@school.com", result.Email);
        Assert.Equal(UserRole.Student, result.Role);

        var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "newstudent@school.com");
        Assert.NotNull(dbUser);
    }
}
