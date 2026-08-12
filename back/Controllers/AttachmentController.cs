using CDOP;
using CDOP.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Processing.Processors.Transforms;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Processing.Processors.Transforms;
namespace CDOP.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowLocalhost3000")]
    [Authorize(Roles = "LDAPUser,Visitor,Specialist,Admin")]
    public class AttachmentController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AttachmentController> _logger;
        public AttachmentController(ApplicationDbContext context, UserManager<IdentityUser> userManager, IConfiguration configuration, ILogger<AttachmentController> logger)
        {
            _context = context;
            _userManager = userManager;
            _configuration = configuration;
            _logger = logger;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attachment>>> GetAttachments(int id)
        {
            var user = User;

            if (user.IsInRole("LDAPUser"))
            {
                string musterino = id.ToString("D8");
                string query = "SELECT * FROM dbo.Attachments WHERE Flow = 'Supervisor' AND MUSTERINO = @musterino";

                var attachments = await _context.Attachments
                    .FromSqlRaw(query, new SqlParameter("@musterino", musterino))
                    .ToListAsync();

                var result = attachments.Select(a => new
                {
                    a.AttachmentID,
                    a.VisitID,
                    a.ImageUploadDate,
                    a.ImageUrl,
                    a.ImageStandardName,
                    a.SupervisorApproval,
                    a.SupervisorComment,
                    a.SupervisorActionDateTime,
                    a.MerchApproval,
                    a.MerchComment,
                    a.Category,
                    a.Flow,
                    a.DISTKODU,
                    a.MUSTERINO,
                    a.Lat,
                    a.Long,
                    a.MerchActionDateTime,
                    a.MerchApprover,
                    a.SupervisorApprover,
                    ImageDataBase64 = a.ImageData != null ? Convert.ToBase64String(a.ImageData) : null

                });

                return Ok(result);
            }
             if (user.IsInRole("Specialist"))
            {
                string musterino = id.ToString("D8");
                string query = "SELECT * FROM dbo.Attachments WHERE Flow = 'Specialist' AND MUSTERINO = @musterino";
                var attachments = await _context.Attachments
                    .FromSqlRaw(query, new SqlParameter("@musterino", musterino))
                    .ToListAsync();

                var result = attachments.Select(a => new
                {
                    a.AttachmentID,
                    a.VisitID,
                    a.ImageUploadDate,
                    a.ImageUrl,
                    a.ImageStandardName,
                    a.SupervisorApproval,
                    a.SupervisorComment,
                    a.SupervisorActionDateTime,
                    a.MerchApproval,
                    a.MerchComment,
                    a.Category,
                    a.Flow,
                    a.DISTKODU,
                    a.MUSTERINO,
                    a.Lat,
                    a.Long,
                    a.MerchActionDateTime,
                    a.MerchApprover,
                    a.SupervisorApprover,
                    ImageDataBase64 = a.ImageData != null ? Convert.ToBase64String(a.ImageData) : null

                });

                return Ok(result);
            }
            return NotFound();
        }
        [HttpPost("All")]
        public async Task<ActionResult<IEnumerable<Attachment>>> GetAllAttachment([FromBody] AttachmentQueryParameters queryParams)
        {
            if (queryParams.PageNumber < 1 || queryParams.PageSize < 1)
            {
                return BadRequest("Page number and size must be greater than 0.");
            }

            // Default sortColumn and sortOrder
            var sortColumn = string.IsNullOrEmpty(queryParams.SortColumn) ? "AttachmentID" : queryParams.SortColumn;
            var sortOrder = string.IsNullOrEmpty(queryParams.SortOrder) ? "asc" : queryParams.SortOrder;

            // Base query
            var query = _context.Attachments.AsQueryable();

            // Apply distCode filtering if provided
            if (!string.IsNullOrEmpty(queryParams.DistCode))
            {
                query = query.Where(a => a.DISTKODU == queryParams.DistCode);
            }

            // Apply dynamic filtering based on filterColumn and filterValue if provided
            if (!string.IsNullOrEmpty(queryParams.FilterColumn) && !string.IsNullOrEmpty(queryParams.FilterValue))
            {
                var propertyInfo = typeof(Attachment).GetProperty(queryParams.FilterColumn, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

                if (propertyInfo == null)
                {
                    return BadRequest("Invalid filter column.");
                }

                var parameter = Expression.Parameter(typeof(Attachment), "a");
                var property = Expression.Property(parameter, propertyInfo);

                // Handle date filtering specifically
                if (propertyInfo.PropertyType == typeof(DateTime) || propertyInfo.PropertyType == typeof(DateTime?))
                {
                    if (DateTime.TryParse(queryParams.FilterValue, out DateTime filterDate))
                    {
                        if (propertyInfo.PropertyType == typeof(DateTime?))
                        {

                            query = query.Where(a => a.ImageUploadDate.Date == filterDate.Date);
                            // query = query.Where(a => a.ImageUploadDate && a.ImageUploadDate.Date == filterDate.Date);
                        }
                        else
                        {
                            query = query.Where(a => a.ImageUploadDate.Date == filterDate.Date);
                        }
                    }
                    else
                    {
                        return BadRequest("Invalid date format.");
                    }
                }
                // Handle string filtering (e.g., Flow, StandardName, Musterino)
                else if (propertyInfo.PropertyType == typeof(string))
                {
                    var filterValue = Expression.Constant(queryParams.FilterValue);
                    var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
                    var filterExpression = Expression.Call(property, containsMethod, filterValue);
                    var lambda = Expression.Lambda<Func<Attachment, bool>>(filterExpression, parameter);

                    query = query.Where(lambda);
                }
                else
                {
                    return BadRequest("Unsupported filter type.");
                }
            }

            // Apply sorting dynamically
            if (!string.IsNullOrEmpty(sortColumn))
            {
                var propertyInfo = typeof(Attachment).GetProperty(sortColumn, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

                if (propertyInfo == null)
                {
                    return BadRequest("Invalid sort column.");
                }

                var parameter = Expression.Parameter(typeof(Attachment), "a");
                var property = Expression.Property(parameter, propertyInfo);
                var lambda = Expression.Lambda(property, parameter);

                var method = sortOrder.ToLower() == "asc" ? "OrderBy" : "OrderByDescending";
                var types = new[] { typeof(Attachment), propertyInfo.PropertyType };
                var resultExpression = Expression.Call(
                    typeof(Queryable),
                    method,
                    types,
                    query.Expression,
                    lambda
                );

                query = query.Provider.CreateQuery<Attachment>(resultExpression);
            }

            // Total count of filtered attachments
            var totalAttachmentsCount = await query.CountAsync();

            // Apply pagination
            var attachments = await query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .ToListAsync();

            // Transform the data for the response
            var result = attachments.Select(a => new
            {
                a.AttachmentID,
                a.VisitID,
                a.ImageUploadDate,
                a.ImageUrl,
                a.ImageStandardName,
                a.SupervisorApproval,
                a.SupervisorComment,
                a.SupervisorActionDateTime,
                a.MerchApproval,
                a.MerchComment,
                a.Category,
                a.Flow,
                a.DISTKODU,
                a.MUSTERINO,
                a.Lat,
                a.Long,
                a.MerchActionDateTime,
                a.MerchApprover,
                a.SupervisorApprover,
                ImageDataBase64 = a.ImageData != null ? Convert.ToBase64String(a.ImageData) : null
            });

            // Calculate total pages
            var totalPages = (int)Math.Ceiling((double)totalAttachmentsCount / queryParams.PageSize);

            // Prepare the response
            var response = new
            {
                TotalCount = totalAttachmentsCount,
                PageSize = queryParams.PageSize,
                PageNumber = queryParams.PageNumber,
                TotalPages = totalPages,
                Attachments = result
            };

            return Ok(response);
        }
        // for a test liberay read table.
        [HttpGet("Alls")]
        public async Task<ActionResult<IEnumerable<Attachment>>> GetAllAttachments(string distCode = "")
        {
            var user = User;


            // Total count of filtered attachments
            var totalAttachmentsCount = await _context.Attachments
                .Where(a => a.DISTKODU == distCode)
                .CountAsync();

            // Paginated attachments
            var attachments = await _context.Attachments
                .Where(a => a.DISTKODU == distCode)
               
                .ToListAsync();

            var result = attachments.Select(a => new
            {
                a.AttachmentID,
                a.VisitID,
                a.ImageUploadDate,
                a.ImageUrl,
                a.ImageStandardName,
                a.SupervisorApproval,
                a.SupervisorComment,
                a.SupervisorActionDateTime,
                a.MerchApproval,
                a.MerchComment,
                a.Category,
                a.Flow,
                a.DISTKODU,
                a.MUSTERINO,
                a.Lat,
                a.Long,
                a.MerchActionDateTime,
                a.MerchApprover,
                a.SupervisorApprover,
                ImageDataBase64 = a.ImageData != null ? Convert.ToBase64String(a.ImageData) : null
            });
            var response = new
            {
                Attachments = result
            };

            return Ok(response);
        }
        [HttpGet("customers")]
        public async Task<ActionResult<IEnumerable<Attachment>>> GetAllCustomer(string distCode = "")
        {
            var user = User;

            // Total count of filtered attachments
            var totalAttachmentsCount = await _context.Attachments
                .Where(a => a.DISTKODU == distCode)
                .CountAsync();

            // Paginated attachments
            var attachments = await _context.Attachments
                .Where(a => a.DISTKODU == distCode)
                .ToListAsync();

            var result = attachments.Select(a => new
            {
               a.MUSTERINO,
               
            });

            var response = new
            {
             
                Attachments = result
            };

            return Ok(response);
        }

        [HttpGet("{musterino}/{attachmentID}")]
        public async Task<ActionResult<Attachment>> GetAttachment(string musterino, int attachmentID)
        {
            string formattedMusterino = musterino.PadLeft(8, '0'); // Ensure musterino is 8 characters long
            string query = "SELECT * FROM dbo.Attachments WHERE Flow = 'Draft' AND MUSTERINO = @musterino AND AttachmentID = @attachmentID";
            var attachment = await _context.Attachments
                .FromSqlRaw(query,
                    new SqlParameter("@musterino", formattedMusterino),
                    new SqlParameter("@attachmentID", attachmentID))
                .FirstOrDefaultAsync();

            if (attachment == null)
            {
                return NotFound();
            }

            var result = new
            {
                attachment.AttachmentID,
                attachment.VisitID,
                attachment.ImageUploadDate,
                attachment.ImageUrl,
                attachment.ImageStandardName,
                attachment.SupervisorApproval,
                attachment.SupervisorComment,
                attachment.SupervisorActionDateTime,
                attachment.MerchApproval,
                attachment.MerchComment,
                attachment.Category,
                attachment.Flow,
                attachment.DISTKODU,
                attachment.MUSTERINO,
                attachment.Lat,
                attachment.Long,
                attachment.MerchActionDateTime,
                ImageDataBase64 = attachment.ImageData != null ? Convert.ToBase64String(attachment.ImageData) : null
            };

            return Ok(result);
        }
        /* [HttpPost]
         public ActionResult<Attachment> PostAttachment([FromForm] AttachmentViewModel model)
         {
             if (model.File == null || model.File.Length == 0)
                 return BadRequest("No file uploaded.");

             // بررسی وجود VisitID
             var visit = _context.Visits.Find(model.VisitID);
             if (visit == null)
             {
                 return NotFound("Visit not found.");
             }

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
             var newAttachment = new Attachment
             {
                 VisitID = model.VisitID,  // استفاده از VisitID
                 ImageUploadDate = DateTime.Now,
                 ImageStandardName = model.File.FileName,
                 ImageUrl = "default_url",
                 SupervisorApproval = "Pending",
                 ImageData = imageBytes,
                 Lat = model.Lat,
                 Long = model.Long,
                 SupervisorComment = string.Empty,
                 SupervisorActionDateTime = null,
                 MerchApproval = string.Empty,
                 MerchComment = string.Empty,
                 Category = string.Empty,
                 Flow = string.Empty,
                 MerchActionDateTime = null
             };

             _context.Attachments.Add(newAttachment);
             _context.SaveChanges();
             return CreatedAtAction(nameof(GetAttachment), new { id = newAttachment.AttachmentID }, newAttachment);
         }
 */
        /*   [HttpPost]
           [ProducesResponseType(StatusCodes.Status400BadRequest)]
           [ProducesResponseType(StatusCodes.Status404NotFound)]
           [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Attachment))] // Specify the type returned
           public ActionResult<Attachment> PostAttachment([FromForm] AttachmentViewModel model)
           {
               if (model.File == null || model.File.Length == 0)
                   return BadRequest("No file uploaded.");

               var visit = _context.Visits.Include(v => v.Attachments).FirstOrDefault(v => v.VisitID == model.VisitID);
               if (visit == null)
               {
                   return NotFound("Visit not found.");
               }

               var shop = GetShopDetails(visit.SUHCode, visit.CustomerCode); // یک تابع که اطلاعات Shop را واکشی می‌کند

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

               var imageName = $"{shop.DISTKODU}_{shop.PG4ADI}_{visit.SUHCode}_{DateTime.UtcNow:yyyyMMdd}_{DateTime.UtcNow:HHmmss}_{visit.Attachments.Count + 1}";

               var newAttachment = new Attachment
               {
                   VisitID = model.VisitID,
                   ImageUploadDate = DateTime.Now,
                   ImageStandardName = imageName,
                   ImageUrl = "default_url",
                   SupervisorApproval = "Pending",
                   ImageData = imageBytes,
                   Lat = model.Lat,
                   Long = model.Long,
                   SupervisorComment = string.Empty,
                   SupervisorActionDateTime = null,
                   MerchApproval = string.Empty,
                   MerchComment = string.Empty,
                   Category = string.Empty,
                   Flow = string.Empty,
                   MerchActionDateTime = null
               };

               _context.Attachments.Add(newAttachment);
               _context.SaveChanges();
               return Ok( CreatedAtAction(nameof(GetAttachment), new { id = newAttachment.AttachmentID }, newAttachment));
           }
   */


        [HttpPost]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Attachment))] // تعیین نوع پاسخ برای Swagger
         public async Task<IActionResult> PostAttachment([FromForm] AttachmentViewModel model)
              {
                  if (model.File == null || model.File.Length == 0)
                      return BadRequest("No file uploaded.");

                  var visit = _context.Visits.Include(v => v.Attachments).FirstOrDefault(v => v.VisitID == model.VisitID);
                  if (visit == null)
                  {
                      return NotFound("Visit not found.");
                  }

                  var shop = GetShopDetails(visit.SUHCode, visit.CustomerCode);
                  using var image = Image.Load(model.File.OpenReadStream());
              /*
               image.Mutate(x => x.Resize(new ResizeOptions
               {
                  // Mode = ResizeMode.BoxPad,//// Maintain aspect ratio and pad with background
                   Mode = ResizeMode.Max,
                   Size = new Size(1920, 1080)
               }));*/

           using var ms = new MemoryStream();
            image.SaveAsJpeg(ms/*, new JpegEncoder
            {
                Quality = 90 // Adjust quality (0-100) for better image quality
            }*/);
            var imageBytes = ms.ToArray();


              var attachmentNumber = (visit.Attachments.Count + 1).ToString("D2");
                  string newSUHCode = visit.SUHCode.Replace("SUH-", "");
                  var imageName = $"{shop.DISTKODU}_{shop.PG4ADI}_{shop.MUSTERINO}_{newSUHCode}_{DateTime.UtcNow:yyyyMMdd}_{DateTime.UtcNow:HHmmss}_{attachmentNumber}";

                  var newAttachment = new Attachment
                  {
                      VisitID = model.VisitID,
                      ImageUploadDate = DateTime.Now,
                      ImageStandardName = imageName,
                      ImageUrl = "default_url",
                      SupervisorApproval = "Pending",
                      ImageData = imageBytes,
                      Lat = model.Lat,
                      Long = model.Long,
                      SupervisorComment = string.Empty,
                      SupervisorActionDateTime = null,
                      MerchApproval = string.Empty,
                      MerchComment = string.Empty,
                      Category = string.Empty,
                      Flow = "Draft",
                      MerchActionDateTime = null,
                      DISTKODU = shop.DISTKODU,
                      MUSTERINO = shop.MUSTERINO,
                      MerchApprover= string.Empty,
                      SupervisorApprover = string.Empty,


                  };
                  _context.Attachments.Add(newAttachment);
                  _context.SaveChanges();

                  // بازگرداندن 200 OK با مدل Attachment به عنوان پاسخ
                  return Ok(newAttachment);
              }
  

      
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Attachment))] // تعیین نوع پاسخ برای Swagger
        public async Task<IActionResult> UpdateAttachmentImage(int id)
        {
            // گرفتن پیوست از پایگاه‌داده
            var attachment = await _context.Attachments.FindAsync(id);
            if (attachment == null)
            {
                return NotFound("Attachment not found.");
            }

            // بارگذاری تصویر از داده‌های باینری
            using var ms = new MemoryStream(attachment.ImageData);
            using var image = Image.Load(ms);

            // چرخاندن تصویر به اندازه 90 درجه
            image.Mutate(x => x.Rotate(-90));

            // ذخیره تصویر به فرمت JPEG
            using var updatedMs = new MemoryStream();
            image.SaveAsJpeg(updatedMs);
            attachment.ImageData = updatedMs.ToArray();

            // به‌روزرسانی اطلاعات در پایگاه‌داده
            _context.Attachments.Update(attachment);
            await _context.SaveChangesAsync();

            // بازگرداندن 200 OK با مدل Attachment به عنوان پاسخ
            return Ok(attachment);
        }



        private Shop GetShopDetails(string suhCode, string customerCode)
        {
            // تابعی که اطلاعات Shop را واکشی می‌کند، همانطور که در کنترلر GoldenShopController وجود دارد
            string connectionString = _configuration.GetConnectionString("PeraConnection");
            string query = $@"SELECT DT.[PG1], DT.[PG1ADI], DT.[PG2ADI], DT.[PG4ADI], DT.[MUSTERINO], DT.[UNVAN], DT.[DISTKODU], [PSEKODU], [PROMOSYONSINIFI], [ODEMETIPI], [DURUMU], isnull(OZELLIKKODU,0) [Golden]
                      FROM [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT 
                      LEFT JOIN [UniDATA].[dbo].MUSTERIOZELLIK 
                      ON MUSTERIOZELLIK.MUSTERINO = DT.MUSTERINO 
                      WHERE isnull(OZELLIKKODU,0)='1' AND DT.PSEKODU ='{suhCode}' AND DT.MUSTERINO ='{customerCode}'";

            var shop = new Shop();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    connection.Open();
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            shop = new Shop
                            {
                                PG1 = reader["PG1"].ToString(),
                                PG1ADI = reader["PG1ADI"].ToString(),
                                PG2ADI = reader["PG2ADI"].ToString(),
                                PG4ADI = reader["PG4ADI"].ToString(),
                                // MUSTERINO = Convert.ToInt32(reader["MUSTERINO"]),
                                MUSTERINO = reader["MUSTERINO"].ToString(),
                                UNVAN = reader["UNVAN"].ToString(),
                                DISTKODU = reader["DISTKODU"].ToString(),
                                PSEKODU = reader["PSEKODU"].ToString(),
                                PROMOSYONSINIFI = reader["PROMOSYONSINIFI"].ToString(),
                                ODEMETIPI = reader["ODEMETIPI"].ToString(),
                                DURUMU = reader["DURUMU"].ToString(),
                                OZELLIKKODU = Convert.ToInt32(reader["Golden"])
                            };
                        }
                    }
                }
            }
            return shop;
        }
        [HttpPut()]
        public async Task<IActionResult> PutAttachment([FromBody] AttachmentUpdateDto updateDto)
        {
            var existingAttachment = await _context.Attachments.FindAsync(updateDto.AttachmentID);
            if (existingAttachment == null)
            {
                return NotFound();
            }

            // Update the properties you want to change
            if (!string.IsNullOrEmpty(updateDto.SupervisorApproval))
            {  
                existingAttachment.SupervisorApproval = updateDto.SupervisorApproval;
            }
             if (!string.IsNullOrEmpty(updateDto.SupervisorComment))
            {  existingAttachment.SupervisorComment = updateDto.SupervisorComment;
            }
            if (!string.IsNullOrEmpty(updateDto.Flow))
            {
                  existingAttachment.Flow = updateDto.Flow;
            }
            if (!string.IsNullOrEmpty(updateDto.SupervisorApprover))
            {
                existingAttachment.SupervisorApprover =  updateDto.SupervisorApprover;
            }
            if (!string.IsNullOrEmpty(updateDto.MerchApprover))
            {
                existingAttachment.MerchApprover= updateDto.MerchApprover;
            }
            if (!string.IsNullOrEmpty(updateDto.MerchComment))
            {
                existingAttachment.MerchComment = updateDto.MerchComment;
            }
            if (!string.IsNullOrEmpty(updateDto.MerchApproval))
            {
                existingAttachment.MerchApproval= updateDto.MerchApproval;
            }
            if (updateDto.SupervisorActionDateTime != null)
            {
                existingAttachment.SupervisorActionDateTime= updateDto.SupervisorActionDateTime;

            }
            if (updateDto.MerchActionDateTime != null)
            {
                    existingAttachment.MerchActionDateTime= updateDto.MerchActionDateTime;
            }

            _context.Entry(existingAttachment).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttachment(int id)
        {
            try
            {
                var attachment = await _context.Attachments.FindAsync(id);
                if (attachment == null)
                {
                    // Log that the attachment was not found
                    _logger.LogWarning($"Attachment with ID {id} not found.");
                    return NotFound();
                }

                _context.Attachments.Remove(attachment);
                await _context.SaveChangesAsync();

                // Log successful deletion
                _logger.LogInformation($"Attachment with ID {id} successfully deleted.");
                return NoContent();
            }
            catch (Exception ex)
            {
                // Log the exception
                _logger.LogError($"Error deleting attachment with ID {id}: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }
        private async Task<bool> CheckAllAttachmentsSupervisorApprovalPending(string musterino)
        {
            var attachments = await _context.Attachments
                .Where(a => a.MUSTERINO == musterino)
                .ToListAsync();

            return attachments.All(a => a.SupervisorApproval == "Pending");
        }
    }
}