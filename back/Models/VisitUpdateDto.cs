namespace CDOP.Models
{
    public class VisitUpdateDto
    {
        public int VisitID { get; set; }
    //    public DateTime VisitDate { get; set; }
     //   public string SuhCode { get; set; }
     //   public string CustomerCode { get; set; }
        public string? SupervisorApproval { get; set; }
        public string? SupervisorComment { get; set; }
        public DateTime? SupervisorActionDateTime { get; set; }
        public DateTime? MerchActionDateTime { get; set; }
        public string? MerchApproval { get; set; }
        public string? MerchComment { get; set; }
        public string? Flow { get; set; }
        public string? MerchApprover { get; set; }
        public int? Score { get; set; }
        public string? SupervisorApprover { get; set; }
        public string? VisitorApprover { get; set; }
        public string? VisitorComment { get; set; }
    }
}
