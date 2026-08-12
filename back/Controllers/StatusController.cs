using CDOP.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace CDOP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   // [Authorize(Roles = "LDAPUser,Visitor")]
    [EnableCors("AllowLocalhost3000")]

    public class StatusController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AttachmentController> _logger;

        public StatusController(ApplicationDbContext context, UserManager<IdentityUser> userManager, IConfiguration configuration, ILogger<AttachmentController> logger)
        {
            _context = context;
            _userManager = userManager;
            _configuration = configuration;
            _logger = logger;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attachment>>> GetAttachmentscustomer(string id)

        {
            //string musterino = id.ToString("D8");
            string musterino = id;
            string query = "SELECT * FROM dbo.Attachments WHERE MUSTERINO = @musterino";
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
        
        [HttpGet("byVistId/{visitId}")]
        public async Task<ActionResult<IEnumerable<Attachment>>> GetAttachmentsVisit(int visitId)

        {
            //string musterino = id.ToString("D8");
           
            string query = "SELECT * FROM dbo.Attachments WHERE VisitID = @visitId";
            var attachments = await _context.Attachments
                .FromSqlRaw(query, new SqlParameter("@visitId", visitId))
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

        [HttpGet("customer/{customerNumber}/latlang")]
        public async Task<ActionResult<LocationResponse>> GetCustomerLatLang(string customerNumber)
        {
            string connectionString = _configuration.GetConnectionString("PeraConnection");
            string query = @"
        SELECT TOP 1
            C.Latitude, 
            C.Longitude 
        FROM 
            [UniDATA].[dbo].[WF_CustomerMasterData_OLAP] C
        WHERE 
            C.[MUSTERINO] = @CustomerNumber";

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@CustomerNumber", customerNumber);
                    connection.Open();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var latitude = reader["Latitude"] != DBNull.Value ? Convert.ToDouble(reader["Latitude"]) : 0;
                            var longitude = reader["Longitude"] != DBNull.Value ? Convert.ToDouble(reader["Longitude"]) : 0;

                            var locationResponse = new LocationResponse
                            {
                                Latitude = latitude,
                                Longitude = longitude
                            };

                            return Ok(locationResponse); // Return JSON automatically
                        }
                        else
                        {
                            return NotFound("Customer not found.");
                        }
                    }
                }
            }
        }
    }
}