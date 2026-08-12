namespace CDOP.Models
{
    public class Shop
    {
            public string PG1 { get; set; }
            public string PG1ADI { get; set; }
            public string PG2ADI { get; set; }
            public string PG4ADI { get; set; }
            public string MUSTERINO { get; set; }
            public string UNVAN { get; set; }
            public string DISTKODU { get; set; }
            public string PSEKODU { get; set; }
            public string PROMOSYONSINIFI { get; set; }
            public string ODEMETIPI { get; set; }
            public string DURUMU { get; set; }
            public string Flow { get; set; }

            public int? OZELLIKKODU { get; set; } // Nullable integer for OZELLIKKODU


            public int VisitID { get; set; }
        // public DateTime? VisitDate { get; set; }
            public string VisitTime { get; set; }  // رشته برای نمایش زمان

    }
}
