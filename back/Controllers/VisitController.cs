using CDOP.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Reflection;
using System.Security.Claims;
using System.Text.Json;

namespace CDOP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowLocalhost3000")]
    [Authorize(Roles = "LDAPUser, Visitor,Specialist,Admin")]
    public class VisitController : Controller
    {

        private readonly UserManager<IdentityUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public VisitController(ApplicationDbContext context, UserManager<IdentityUser> userManager, IConfiguration configuration)
        {
            _context = context;
            _userManager = userManager;
            _configuration = configuration;
        }
        [HttpGet]
        public async Task< ActionResult<IEnumerable<Visit>>> GetVisits()
        { 
            return _context.Visits.ToList();
        }

       [HttpGet("{id}")]
        public ActionResult<Visit> GetVisit(int id)
        {
            var visit = _context.Visits.Find(id);

            if (visit == null)
            {
                return NotFound();
            }

            return visit;
        }
        [HttpGet("byCustomerCode/{customerCode}")]
        public ActionResult<IEnumerable<Visit>> GetVisitsByCustomerCode(string customerCode)
        {
            var today = DateTime.UtcNow.Date; // Use DateTime.UtcNow.Date to get today's date in UTC

            // Retrieve the latest visit for the given customer code and today’s date
            var latestVisit = _context.Visits
                .Where(v => v.CustomerCode == customerCode && v.VisitDate.Date == today)
                .OrderByDescending(v => v.VisitDate) // Order by VisitDate in descending order to get the latest visit
                .FirstOrDefault();

            if (latestVisit == null)
            {
                return Ok(latestVisit);
            }

            return Ok(latestVisit);
        } 
        [HttpGet("vistbyCustomerCode/{customerCode}")]
        public ActionResult<IEnumerable<object>> GetAllVisitsByCustomerCode(string customerCode)
        {
            var today = DateTime.UtcNow.Date; // Use DateTime.UtcNow.Date to get today's date in UTC

            // Retrieve the latest visit for the given customer code and today’s date
            var latestVisit = _context.Visits
                .Where(v => v.CustomerCode == customerCode)
                .Select(v => new
                {
                    v.VisitID,
                    VisitDate = v.VisitDate.ToString("yyyy/MM/dd HH:mm"),
                    v.SUHCode,
                    v.CustomerCode,
                    v.SupervisorApproval,
                    v.SupervisorComment,
                    SupervisorActionDateTime = v.SupervisorActionDateTime.HasValue ? v.SupervisorActionDateTime.Value.ToString("yyyy/MM/dd HH:mm") : null,
                    MerchActionDateTime = v.MerchActionDateTime.HasValue ? v.MerchActionDateTime.Value.ToString("yyyy/MM/dd HH:mm") : null,
                    v.MerchApproval,
                    v.MerchComment,
                    v.Flow,
                    v.MerchApprover,
                    v.Score,
                    v.SupervisorApprover,
                  
                }).ToList();

            return Ok(latestVisit);
        }

        [HttpGet("VisitorName")]
        public async Task<ActionResult<object>> GetAllcustomer()
        {
            var user = User;
            var userName = user.Identity?.Name;
            if (userName == null)
            {
                return Unauthorized();
            }
            string connectionString = _configuration.GetConnectionString("PeraConnection");
            string query = $@"SELECT [PSEKODU], [PSEADI]
                      FROM [UniDATA].[dbo].[GT_Visitors] 
                      WHERE PSEKODU = '{userName}'";
            var data = new List<object>(); // Use a list to hold multiple records if needed
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                using (SqlCommand command = new SqlCommand(query, connection))
                {

                    connection.Open();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            // Add each record as an anonymous object
                            data.Add(new
                            {
                                PSEKODU = reader["PSEKODU"].ToString(),
                                PSEADI = reader["PSEADI"].ToString()
                            });
                        }
                    }
                }
            }
            return Ok(data); // Return the list as JSON
        }



        [HttpPost]
        public async Task<ActionResult<Visit>> PostVisit(string customerCode)
        {
            var user = User;
            var userName = user.Identity.Name;
            TimeZoneInfo tehranTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Iran Standard Time");
            DateTime tehranDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tehranTimeZone);
            Visit visit = new Visit
            {
                SUHCode = userName,
                CustomerCode = customerCode,
                VisitDate = tehranDateTime,
                Flow= "Draft",

                // تاریخ و زمان فعلی برای VisitDate
            };

            // افزودن ویزیت به مجموعه ویزیت‌ها در DbContext
            _context.Visits.Add(visit);

            // ذخیره تغییرات در پایگاه داده
            _context.SaveChanges();

            // بازگشت نتیجه ایجاد با لینک به اکشن GetVisit و آیدی جدید ویزیت
            return CreatedAtAction(nameof(GetVisit), new { id = visit.VisitID }, visit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutVisit(int id, [FromBody] VisitUpdateDto updateDto)
        {
            var user = User;
            if (id != updateDto.VisitID)
            {
                return BadRequest();
            }

            var existingVisit = await _context.Visits.FindAsync(id);
            if (existingVisit == null)
            {
                return NotFound();
            }

            // Update based on role
            UpdateVisitBasedOnRole(user, existingVisit, updateDto);

            // Update Flow and related Attachments
            UpdateFlowAndAttachments(existingVisit, updateDto);

            // Save changes
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VisitExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private void UpdateVisitBasedOnRole(ClaimsPrincipal user, Visit existingVisit, VisitUpdateDto updateDto)
        {
            if (user.IsInRole("Specialist"))
            {
                UpdateSpecialistFields(existingVisit, updateDto);
            }
            if (user.IsInRole("LDAPUser"))
            {
                UpdateSupervisorFields(existingVisit, updateDto);
            }
            if (user.IsInRole("Visitor"))
            {
                UpdateVisitorFields(existingVisit, updateDto);
            }
        }

        private void UpdateSpecialistFields(Visit existingVisit, VisitUpdateDto updateDto)
        {
         
            if (!string.IsNullOrEmpty(updateDto.MerchApproval))
            {
                existingVisit.MerchApproval = updateDto.MerchApproval;
            }
            if (!string.IsNullOrEmpty(updateDto.Score.ToString()))
            {
                existingVisit.Score = Convert.ToInt32(updateDto.Score);

            }
            if (!string.IsNullOrEmpty(updateDto.MerchComment))
            {
                existingVisit.MerchComment = updateDto.MerchComment;
            }
            if (updateDto.MerchActionDateTime != null)
            {
                existingVisit.MerchActionDateTime = updateDto.MerchActionDateTime;
            }
            if (!string.IsNullOrEmpty(updateDto.MerchApprover))
            {
                existingVisit.MerchApprover = updateDto.MerchApprover;
            }
        }
        private void UpdateSupervisorFields(Visit existingVisit, VisitUpdateDto updateDto)
        {
            if (!string.IsNullOrEmpty(updateDto.SupervisorApproval))
            {
                existingVisit.SupervisorApproval = updateDto.SupervisorApproval;
            }
            if (!string.IsNullOrEmpty(updateDto.SupervisorComment))
            {
                existingVisit.SupervisorComment = updateDto.SupervisorComment;
            }
            if (!string.IsNullOrEmpty(updateDto.SupervisorApprover))
            {
                existingVisit.SupervisorApprover = updateDto.SupervisorApprover;
            }
            if (updateDto.SupervisorActionDateTime != null)
            {
                existingVisit.SupervisorActionDateTime = updateDto.SupervisorActionDateTime;
            }
        }
        private void UpdateVisitorFields(Visit existingVisit, VisitUpdateDto updateDto)
        {
            if (!string.IsNullOrEmpty(updateDto.VisitorApprover))
            {
                existingVisit.VisitorApprover = updateDto.VisitorApprover;
            }
            if (!string.IsNullOrEmpty(updateDto.VisitorComment))
            {
                existingVisit.VisitorComment = updateDto.VisitorComment;
            }
        }
        private void UpdateFlowAndAttachments(Visit existingVisit, VisitUpdateDto updateDto)
        {
            if (!string.IsNullOrEmpty(updateDto.Flow))
            {
                existingVisit.Flow = updateDto.Flow;

                if (existingVisit.Flow == "Supervisor")
                {
                    var AttachmentsWithSameVisit = _context.Attachments.Where(v => v.VisitID == updateDto.VisitID).ToList();
                    foreach (var attachment in AttachmentsWithSameVisit)
                    {
                        attachment.Flow = updateDto.Flow;
                        _context.Entry(attachment).State = EntityState.Modified;
                    }
                }
            }
        }
        private bool VisitExists(int id)
        {
            return _context.Visits.Any(e => e.VisitID == id);
        }
        [HttpDelete("{id}")]
        public async Task< IActionResult> DeleteVisit(int id)
        {
            var visit = _context.Visits.Find(id);
            if (visit == null)
            {
                return NotFound();
            }
            _context.Visits.Remove(visit);
            _context.SaveChanges();
            return NoContent();
        } 
    }
}
