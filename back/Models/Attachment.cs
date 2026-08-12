 using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CDOP.Models
{


    public class Attachment
    {
        [Key]
        public int AttachmentID { get; set; }

        [ForeignKey(nameof(Visit))]
        public int VisitID { get; set; }  // Foreign key
        public DateTime ImageUploadDate { get; set; }
        public string ImageUrl { get; set; } = "default_url"; // مقدار پیش‌فرض برای ImageUrl
        public string ImageStandardName { get; set; }
        public string SupervisorApproval { get; set; } = "Pending"; // مقدار پیش‌فرض
        public string SupervisorComment { get; set; } = string.Empty;
        public DateTime? SupervisorActionDateTime { get; set; }
        public string MerchApproval { get; set; } = string.Empty;
        public string MerchComment { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Flow { get; set; } = string.Empty; 
        public string DISTKODU { get; set; } = string.Empty;
        public string MUSTERINO { get; set; } = string.Empty;
        public string SupervisorApprover { get; set; }
        public string MerchApprover { get; set; }

        public double Lat { get; set; }
        public double Long { get; set; }

        public DateTime? MerchActionDateTime { get; set; }
        [NotMapped]
        public IFormFile File { get; set; }
        public byte[] ImageData { get; set; }
        [NotMapped]
        public string ImageDataBase64 => ImageData != null ? Convert.ToBase64String(ImageData) : null; // Base64-encoded image data

    }

}
