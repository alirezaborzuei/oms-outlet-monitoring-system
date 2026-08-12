namespace CDOP.Models
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsForSupervisor { get; set; }
        public bool IsForVisitor { get; set; }


    }
}
