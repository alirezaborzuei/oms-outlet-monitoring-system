namespace CDOP.Models
{
    public class AttachmentQueryParameters
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string DistCode { get; set; } = "";
        public string SortColumn { get; set; } = "AttachmentID";
        public string SortOrder { get; set; } = "asc";
        public string FilterColumn { get; set; } = "";
        public string FilterValue { get; set; } = "";
    }
}
