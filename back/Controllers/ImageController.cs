using CDOP.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using System.IO.Compression;

namespace CDOP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public ImageController(ApplicationDbContext context, UserManager<IdentityUser> userManager, IConfiguration configuration)
        {
            _context = context;
            _userManager = userManager;
            _configuration = configuration;
        }
        [HttpGet()]
        public IActionResult GetImages(string id)
        {
            var images = _context.Attachments.Where(i => i.MUSTERINO == id).ToList();
            if (images == null || !images.Any())
            {
                return NotFound();
            }

            using (var memoryStream = new MemoryStream())
            {
                using (var zipArchive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
                {
                    foreach (var image in images)
                    {
                        var entry = zipArchive.CreateEntry(image.ImageStandardName+".JPG");
                        using (var entryStream = entry.Open())
                        {
                            entryStream.Write(image.ImageData, 0, image.ImageData.Length);
                        }
                    }
                }

                return File(memoryStream.ToArray(), "application/zip", "images.zip");
            }
        }
        [HttpGet("{id}")]
         public IActionResult GetImage(int id)
         {
             var image = _context.Attachments.FirstOrDefault(i => i.AttachmentID == id);
             if (image == null)
             {
                 return NotFound();
             }

             return File(image.ImageData, "image/jpeg");
         }
        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] Attachment model)
        {
            if (model.File == null || model.File.Length == 0)
                return BadRequest("No file uploaded.");
            using var image = Image.Load(model.File.OpenReadStream());
            if (image.Width <= image.Height)
                return BadRequest("The image must be horizontal.");
            if (image.Width > 1920 || image.Height > 1080)
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(1920, 1080)
                }));
            }
            using var ms = new MemoryStream();
            image.SaveAsJpeg(ms);
            var imageBytes = ms.ToArray();
            string connectionString = _configuration.GetConnectionString("DefaultConnection");
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                var command = new SqlCommand("INSERT INTO Attachments (ImageData) VALUES (@ImageData)", connection);
                command.Parameters.AddWithValue("@ImageData", imageBytes);
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();
            }
            return Ok("File uploaded successfully.");
        }
    }
}