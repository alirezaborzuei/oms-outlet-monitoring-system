namespace CDOP.Models
{
    public class AttachmentViewModel
    {
        public int VisitID { get; set; }

        public IFormFile File { get; set; }
        public double Lat { get; set; }
        public double Long { get; set; }

    }
}
