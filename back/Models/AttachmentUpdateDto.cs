namespace CDOP.Models
{
    public class AttachmentUpdateDto
    {
        public int AttachmentID { get; set; }
        public string SupervisorApproval { get; set; } = "Pendding";

        public string SupervisorComment { get; set; } = string.Empty;
        // Add other fields as needed

        public string SupervisorApprover { get; set; } = string.Empty;
        public DateTime? SupervisorActionDateTime { get; set; }

        public DateTime? MerchActionDateTime { get; set; }
        public string MerchApproval { get; set; } = string.Empty;
        public string MerchComment { get; set; } = string.Empty;
        public string MerchApprover { get; set; } = string.Empty;
        public string Flow { get; set; } = "Supervisor";




    }
}
