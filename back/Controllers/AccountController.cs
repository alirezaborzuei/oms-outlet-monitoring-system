using CDOP.Models;
using CDOP;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SixLabors.ImageSharp;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Data;

[Route("api/[controller]")]
[ApiController]
[EnableCors("AllowLocalhost3000")]

public class AccountController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly TokenService _tokenService;
    private readonly ILogger<AccountController> _logger;
    private readonly LdapService _ldapService;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;

    public AccountController(ApplicationDbContext context,UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, TokenService tokenService, ILogger<AccountController> logger, LdapService ldapService, IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _logger = logger;
        _ldapService = ldapService;
        _configuration = configuration;
        _context = context;
    }
    [Authorize(Roles = "Visitor")]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _userManager.FindByNameAsync(User.Identity.Name);

        if (user == null)
        {
            return Unauthorized("User not found.");
        }

        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return Ok(new { Message = "Password changed successfully" });
    }


    /*  [HttpPost("reset-password")]
      public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
      {
          if (!ModelState.IsValid)
          {
              return BadRequest(ModelState);
          }

          var user = await _userManager.FindByNameAsync(model.Username);

          if (user == null)
          {
              return BadRequest("User not found.");
          }

          // Generate a random password
          var newPassword = GenerateRandomPassword();

          // Check if the username matches the specific value for PSEKODU
          string pseKodu = model.Username; // مقدار PSEKODU که می‌خواهید مقایسه کنید
          string phoneNumber = string.Empty;

          if (model.Username.Equals(pseKodu, StringComparison.OrdinalIgnoreCase))
          {
              phoneNumber = await GetPhoneNumber(model.Username);
              if (phoneNumber.StartsWith("0"))
              {
                  phoneNumber = phoneNumber.Substring(1);
              }
          }


          // Return both the new password and phone number
          return Ok(new
          {
              NewPassword = newPassword,
              PhoneNumber = phoneNumber
          });
      }*/

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _userManager.FindByNameAsync(model.Username);

        if (user == null)
        {
            return BadRequest("User not found.");
        }

        // Generate a random password
        var newPassword = GenerateRandomPassword();

        // Generate a password reset token
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        // Reset the password using the generated token
        var resetResult = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

        if (!resetResult.Succeeded)
        {
            return BadRequest("Failed to reset the password.");
        }

        // Check if the username matches the specific value for PSEKODU
        string pseKodu = model.Username; // مقدار PSEKODU که می‌خواهید مقایسه کنید
        string phoneNumber = string.Empty;

        if (model.Username.Equals(pseKodu, StringComparison.OrdinalIgnoreCase))
        {
            phoneNumber = await GetPhoneNumber(model.Username);
            if (phoneNumber.StartsWith("0"))
            {
                phoneNumber = phoneNumber.Substring(1);
            }
        }

        // Return both the new password and phone number
        return Ok(new
        {
            NewPassword = newPassword,
            PhoneNumber = phoneNumber
        });
    }

    private async Task<string> GetPhoneNumber(string userName)
    {
        string phoneNumber = string.Empty;

        string query = $@"SELECT [TELEFON] 
                      FROM [UniDATA].[dbo].[GT_Visitors] 
                      WHERE [PSEKODU] = @PSEKODU";

        string connectionString = _configuration.GetConnectionString("PeraConnection");
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@PSEKODU", userName); // استفاده از پارامتر برای جلوگیری از SQL Injection
                connection.Open();
                object result = await command.ExecuteScalarAsync();
                if (result != null)
                {
                    phoneNumber = result.ToString();
                }
            }
        }

        return phoneNumber;
    }

    private string GenerateRandomPassword()
    {
        const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lowercase = "abcdefghijklmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string symbols = "!@#$%^&*()";

        Random random = new Random();

        // Ensure the password contains at least one uppercase letter, one symbol, and the required length
        string password = new string(Enumerable.Repeat(lowercase, 5)
                              .Select(s => s[random.Next(s.Length)]).ToArray()) // Add lowercase letters
                       + uppercase[random.Next(uppercase.Length)] // Add one uppercase
                       + symbols[random.Next(symbols.Length)] // Add one symbol
                       + digits[random.Next(digits.Length)]; // Add one digit to meet length requirement

        return new string(password.OrderBy(x => random.Next()).ToArray()); // Shuffle characters
    }

    [HttpPost("import-users")]
    public async Task<IActionResult> ImportUsers(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File not selected");
        }

        var users = new List<RegisterModel>();
        using (var stream = new StreamReader(file.OpenReadStream()))
        {
            while (!stream.EndOfStream)
            {
                var line = await stream.ReadLineAsync();
                var values = line.Split(',');

                if (values.Length >= 2)
                {
                    // Assuming first column is username, second is password
                    var user = new RegisterModel
                    {
                        Username = values[0].Trim(),
                        Password = values[1].Trim()
                    };
                    users.Add(user);
                }
            }
        }

        foreach (var model in users)
        {
            // Check if the user already exists
            var existingUser = await _userManager.FindByNameAsync(model.Username);
            if (existingUser != null)
            {
                // User already exists, you can skip this user or handle it based on your needs
                continue; // This will skip the creation for the existing user
            }

            var user = new IdentityUser { UserName = model.Username };
            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {

               // return BadRequest(result.Errors);
            }

            // Assign Visitor role as default
           // await _userManager.AddToRoleAsync(user, "Visitor");
        }

        return Ok(new { Message = $"{users.Count} users imported successfully" });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        if (ModelState.IsValid)
        {
            var user = new IdentityUser { UserName = model.Username };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                return Ok(new { Message = "User registered successfully" });
            }

            return BadRequest(result.Errors);
        }
        return BadRequest(ModelState);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        string role = "Visitor"; // Set default role to "Guest"

        // Try to authenticate using Identity
        var user = await _userManager.FindByNameAsync(model.Username);

        if (user != null)
        {
            // Assign role based on username
            role = user.UserName switch
            {
                "Supervisor" => "LDAPUser",
                "merchingAndDesire" => "Specialist",
                "Admin"=>"Admin", 
                _ => role // Keep "Guest" if no match
            };

            var result = await _signInManager.PasswordSignInAsync(model.Username, model.Password, model.RememberMe, false);

            if (result.Succeeded)
            {
                var token = _tokenService.GenerateToken(user, role);
                return Ok(new { Token = token, Role = role });
            }
        }

        // Try to authenticate using LDAP
        if (_ldapService.Authenticate(model.Username, model.Password))
        {
            // Determine the role based on LDAP and other criteria
            role = await GetMerchOrSupervisorRoleAsync(model.Username);

            // If the role is still "Guest", check for Admin roles
            if (role == "Visitor")
            {
                role = await DetermineAdminRoleAsync(model.Username);
            }
            // If the role is still "Guest", return an error
            if (role == "Visitor")
            {
                return BadRequest("Role is undefined.");
            }

            user = new IdentityUser { UserName = model.Username };
            var identityUser = await _userManager.FindByNameAsync(model.Username);
            if (identityUser == null)
            {
                await _userManager.CreateAsync(user);
            }

            var token = _tokenService.GenerateToken(user, role);
            return Ok(new { Token = token, Role = role });
        }

        _logger.LogWarning("Invalid login attempt for user: {Username}", model.Username);
        return Unauthorized("Invalid login attempt");
    }

    private async Task<string> GetMerchOrSupervisorRoleAsync(string userName)
    {
        var data = await _context.MerchUser
            .Where(user => user.ULAccount == userName)
            .ToListAsync();

        if (data != null && data.Any())
        {
            // If user is found in MerchUser table, set role to "Specialist"
            //return "Specialist";
            return data.First().Role;
        }

        // If not found in MerchUser, check if the user is a supervisor
        var distCode = await GetDistkoduSupervisorByUserAsync(userName);
        if (distCode.Count > 0)
        {
            return "LDAPUser"; // Assuming "LDAPUser" is the correct role for supervisors
        }

        return "Guest"; // Default role if no match is found
    }

    private async Task<string> DetermineAdminRoleAsync(string userName)
    {
        var distCode = await GetDistkoduASMByUserAsync(userName);

        if (distCode.Count > 0)
        {
            return "ASM";
        }

        distCode = await GetDistkoduRSMByUserAsync(userName);

        if (distCode.Count > 0)
        {
            return "RSM";
        }

        return "Guest";
    }

    private async Task<List<string>> GetDistkoduSupervisorByUserAsync(string userName)
      {
          userName = @"uli\" + userName;
          string query = "SELECT DISTKODU FROM [UniDATA].[dbo].[Distributor_Supervisors] WHERE SV1 = @userName OR SV2 = @userName OR SV3 = @userName OR SV4 = @userName OR SV5 = @userName";

          List<string> distkoduList = new List<string>();

          using (SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("PeraConnection")))
          {
              using (SqlCommand command = new SqlCommand(query, connection))
              {
                  command.Parameters.AddWithValue("@userName", userName);
                  await connection.OpenAsync();

                  using (SqlDataReader reader = await command.ExecuteReaderAsync())
                  {
                      while (await reader.ReadAsync())
                      {
                          distkoduList.Add(reader["DISTKODU"].ToString());
                      }
                  }
              }
          }
          return distkoduList;
      }
    private async Task<List<string>> GetDistkoduASMByUserAsync(string userName)
      {
          userName = @"uli\" + userName;
          string query = "SELECT DISTKODU FROM [UniDATA].[dbo].[Distributors_ASMs] WHERE [ASM1] = @userName OR [ASM2] = @userName";

          List<string> distkoduList = new List<string>();

          using (SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("PeraConnection")))
          {
              using (SqlCommand command = new SqlCommand(query, connection))
              {
                  command.Parameters.AddWithValue("@userName", userName);
                  await connection.OpenAsync();

                  using (SqlDataReader reader = await command.ExecuteReaderAsync())
                  {
                      while (await reader.ReadAsync())
                      {
                          distkoduList.Add(reader["DISTKODU"].ToString());
                      }
                  }
              }
          }
          return distkoduList;
      }
    private async Task<List<string>> GetDistkoduRSMByUserAsync(string userName)
      {
          userName = @"uli\" + userName;
          string query = "SELECT DISTKODU FROM [UniDATA].[dbo].[Distributors_RSM] WHERE [RSM_Account] = @userName";

          List<string> distkoduList = new List<string>();

          using (SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("PeraConnection")))
          {
              using (SqlCommand command = new SqlCommand(query, connection))
              {
                  command.Parameters.AddWithValue("@userName", userName);
                  await connection.OpenAsync();

                  using (SqlDataReader reader = await command.ExecuteReaderAsync())
                  {
                      while (await reader.ReadAsync())
                      {
                          distkoduList.Add(reader["DISTKODU"].ToString());
                      }
                  }
              }
          }
          return distkoduList;
      }

}