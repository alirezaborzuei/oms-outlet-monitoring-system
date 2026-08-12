using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CDOP.Models;

namespace CDOP
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Visit> Visits { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<MerchUser> MerchUser { get; set; }

        public IEnumerable<object> Shop { get; internal set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);

            /*modelBuilder.Entity<Visit>()
               .Property(v => v.VisitID)
               .ValueGeneratedOnAdd();*/


          /*  modelBuilder.Entity<Visit>()
        .HasMany(v => v.Attachments)
        .WithOne(a => a.Visit)
        .HasForeignKey(a => a.VisitID);*/



            /*    modelBuilder.Entity<Visit>()
                   // .HasMany(c => c.Attachments)
                    .WithOne(a => a.Visit)
                    .HasForeignKey(a => a.VisitID);*/


        }
       

    }
}
