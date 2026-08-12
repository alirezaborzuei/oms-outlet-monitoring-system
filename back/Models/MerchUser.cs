using System.ComponentModel.DataAnnotations;

namespace CDOP.Models
{
    public class MerchUser
    {
        [Key]
        public int Id { get; set; }
        public int DISTKODU { get; set; }

        public string ULAccount { get; set; }

        public string Role { get; set;}
      

    }
}
