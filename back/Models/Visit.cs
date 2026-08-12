using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.ComponentModel.DataAnnotations;
namespace CDOP.Models
{
    public class Visit
    {
        [Key]
        public int VisitID { get; set; }
        public DateTime VisitDate { get; set; }
        public string SUHCode { get; set; } = string.Empty;
        public string CustomerCode { get; set; } = string.Empty;
        //  public string DistCode { get; set; }
        //  public string GRP4 { get; set; }
        //  public string Class { get; set; }

        // Navigation property
        public string SupervisorApproval { get; set; } = "Pending"; // مقدار پیش‌فرض
        public string SupervisorComment { get; set; } = string.Empty;
        public DateTime? SupervisorActionDateTime { get; set; }
        public DateTime? MerchActionDateTime { get; set; }
        public string MerchApproval { get; set; } = string.Empty;
        public string MerchComment { get; set; } = string.Empty;
        public string Flow { get; set; } = "Draft";
        public string MerchApprover { get; set; } = string.Empty;
        public int Score { get; set; } = 0;
        public string SupervisorApprover { get; set; }=string.Empty;
        public string VisitorApprover { get; set; }=string.Empty;
        public string VisitorComment { get; set; }=string.Empty;
        
        public ICollection<Attachment> Attachments { get; set; }
    }
}