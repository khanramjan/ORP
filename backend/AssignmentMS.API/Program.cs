using System.Text;
using AssignmentMS.Core.Interfaces;
using AssignmentMS.Infrastructure.Data;
using AssignmentMS.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger configuration with JWT Auth
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Assignment & Submission Management System API",
        Version = "v1",
        Description = "Role-based API for school/college assignment evaluation system"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// DbContext configuration (PostgreSQL with automatic fallback to InMemory if PostgreSQL server is not running)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
bool isPostgresAvailable = false;

if (!string.IsNullOrEmpty(connectionString) && !connectionString.Contains("Memory"))
{
    try
    {
        var csBuilder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);
        using var client = new System.Net.Sockets.TcpClient();
        var host = string.IsNullOrEmpty(csBuilder.Host) ? "127.0.0.1" : csBuilder.Host;
        var port = csBuilder.Port > 0 ? csBuilder.Port : 5432;

        var connectTask = client.ConnectAsync(host, port);
        if (connectTask.Wait(500) && client.Connected)
        {
            isPostgresAvailable = true;
        }
    }
    catch
    {
        isPostgresAvailable = false;
    }
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (isPostgresAvailable)
    {
        options.UseNpgsql(connectionString, b => b.MigrationsAssembly("AssignmentMS.Infrastructure"));
    }
    else
    {
        Console.WriteLine("[INFO] PostgreSQL server not running on localhost:5432. Falling back to In-Memory Database.");
        options.UseInMemoryDatabase("AssignmentDb");
    }
});

// Register Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<ISubmissionService, SubmissionService>();

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKeyForJwtTokenGeneration2026AssignmentMSApp!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "AssignmentMS.API";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "AssignmentMS.Frontend";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

// Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("TeacherOnly", policy => policy.RequireRole("Teacher"));
    options.AddPolicy("StudentOnly", policy => policy.RequireRole("Student"));
    options.AddPolicy("TeacherOrAdmin", policy => policy.RequireRole("Teacher", "Admin"));
});

// CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Assignment MS API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database created / migrated & seeded
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        if (dbContext.Database.IsRelational())
        {
            dbContext.Database.Migrate();
        }
        else
        {
            dbContext.Database.EnsureCreated();
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Database auto-migration failed or skipped.");
    }
}

app.Run();
