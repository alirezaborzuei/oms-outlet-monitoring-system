using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace CDOP.Models
{
    public class RegisterModel
    {
        [Required]
      //  [EmailAddress]
        public string Username { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }

  
}
