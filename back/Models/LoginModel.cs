using System.ComponentModel.DataAnnotations;

namespace CDOP.Models
{
    public class LoginModel
    {
       
            [Required]
           // [EmailAddress]
            public string Username { get; set; }

            [Required]
            [DataType(DataType.Password)]
            public string Password { get; set; }

            public bool RememberMe { get; set; }
       
    }
}
