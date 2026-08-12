using CDOP;
using CDOP.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CDOP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "LDAPUser, Visitor,Specialist,Admin,ASM,RSM")]

    [EnableCors("AllowLocalhost3000")]
    public class GoldenShopController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public GoldenShopController( IConfiguration configuration)
        {
            _configuration = configuration;
        }  
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Shop>>> Get()
    {       
            var user = User;
            var userName = user.Identity?.Name;
            if(userName == null)
            {
                return Unauthorized();
            }
            if (user.IsInRole("Visitor"))
            {
                string connectionString = _configuration.GetConnectionString("PeraConnection");
                /*  string query = $@"
                              with FinalVisit as (

                               select SUHCode,Flow,CustomerCode,max(VisitID) as VisitID,max(VisitDate) as VisitDate from [10.10.1.79\SQL_PG].GoldenShop.dbo.Visits group by  SUHCode,
          Flow,
          CustomerCode

    )
    SELECT 
    DT.[PG1],
    DT.[PG1ADI],
    DT.[PG2ADI],
    DT.[PG4ADI],
    DT.[MUSTERINO],
    DT.[UNVAN],
    DT.[DISTKODU],
    [PSEKODU], 
    [PROMOSYONSINIFI],
    [ODEMETIPI],
    [DURUMU],
    ISNULL(OZELLIKKODU, 0) AS [Golden],
    V.VisitDate,
    V.VisitID,
    V.Flow
  FROM 
    [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT
  LEFT JOIN 
    [UniDATA].[dbo].MUSTERIOZELLIK MZ
  ON 
    MZ.MUSTERINO = DT.MUSTERINO
  FULL JOIN 
    FinalVisit V
  ON 
    DT.MUSTERINO = V.CustomerCode  COLLATE SQL_Latin1_General_CP1_CI_AS
  WHERE 
    ISNULL(OZELLIKKODU, 0) = '1' 
    --AND (V.VisitDate IS NULL OR CAST(V.VisitDate AS DATE) = CAST(GETDATE() AS DATE)) 
    AND DT.PSEKODU = '{userName}';";*/
                string query = $@"  WITH FinalVisit AS (
    SELECT 
        CustomerCode, 
        SUHCode,
        Flow,
        MAX(VisitID) AS VisitID,
        MAX(VisitDate) AS VisitDate
    FROM 
        [10.10.1.79\SQL_PG].GoldenShop.dbo.Visits
    GROUP BY  
        SUHCode,
        Flow,
        CustomerCode
),
RankedData AS (
    SELECT 
        DT.[PG1],
        DT.[PG1ADI],
        DT.[PG2ADI],
        DT.[PG4ADI],
        DT.[MUSTERINO],
        DT.[UNVAN],
        DT.[DISTKODU],
        [PSEKODU], 
        [PROMOSYONSINIFI],
        [ODEMETIPI],
        [DURUMU],
        ISNULL(OZELLIKKODU, 0) AS [Golden],
        V.VisitDate,
        V.VisitID,
        V.Flow,
        ROW_NUMBER() OVER (PARTITION BY DT.MUSTERINO ORDER BY V.VisitDate DESC) AS RowNum
    FROM 
        [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT
    LEFT JOIN 
        [UniDATA].[dbo].MUSTERIOZELLIK MZ
    ON 
        MZ.MUSTERINO = DT.MUSTERINO
    FULL JOIN 
        FinalVisit V
    ON 
        DT.MUSTERINO = V.CustomerCode COLLATE SQL_Latin1_General_CP1_CI_AS
    WHERE 
        ISNULL(OZELLIKKODU, 0) = '1' 
    -- AND (V.VisitDate IS NULL OR CAST(V.VisitDate AS DATE) = CAST(GETDATE() AS DATE)) 
    AND DT.PSEKODU = '{userName}'
)
SELECT 
    PG1,
    PG1ADI,
    PG2ADI,
    PG4ADI,
    MUSTERINO,
    UNVAN,
    DISTKODU,
    PSEKODU, 
    PROMOSYONSINIFI,
    ODEMETIPI,
    DURUMU,
    Golden,
    VisitDate,
    VisitID,
    Flow
FROM 
    RankedData
WHERE 
    RowNum = 1;";
                var data = new List<Shop>();
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var shop = new Shop
                                {
                                    PG1 = reader["PG1"].ToString(),
                                    PG1ADI = reader["PG1ADI"].ToString(),
                                    PG2ADI = reader["PG2ADI"].ToString(),
                                    PG4ADI = reader["PG4ADI"].ToString(),
                                    //MUSTERINO = Convert.ToInt32(reader["MUSTERINO"]),
                                    MUSTERINO = reader["MUSTERINO"].ToString(),
                                    UNVAN = reader["UNVAN"].ToString(),
                                    DISTKODU = reader["DISTKODU"].ToString(),
                                    PSEKODU = reader["PSEKODU"].ToString(),
                                    PROMOSYONSINIFI = reader["PROMOSYONSINIFI"].ToString(),
                                    ODEMETIPI = reader["ODEMETIPI"].ToString(),
                                    DURUMU = reader["DURUMU"].ToString(),
                                    OZELLIKKODU = Convert.ToInt32(reader["Golden"]),
                                    VisitTime = reader["VisitDate"] == DBNull.Value ? null : ConvertToTehranTime((DateTime)reader["VisitDate"]),
                                    VisitID = reader["VisitID"] == DBNull.Value ? 0 : Convert.ToInt32(reader["VisitID"]),
                                    Flow = reader["Flow"].ToString(),
                                };
                                data.Add(shop);
                            }
                        }
                    }
                }
                return Ok(data);
            }
           
            if (user.IsInRole("LDAPUser"))
            {
                var distkoduList = await GetDistkoduByUserAsync("yasaman.karimkhani"); // userName

                if (distkoduList == null || distkoduList.Count == 0)
                {
                    return NotFound("DISTKODU not found for the specified user.");
                }

                string connectionString = _configuration.GetConnectionString("PeraConnection");

                // Create a comma-separated string of DISTKODU values for the IN clause
                string distkoduInClause = string.Join(",", distkoduList.Select(d => $"'{d}'"));

                string query = $@"
      with Attachments as (
            select CustomerCode,MAX(Flow) AS Flow,Max(VisitID) AS VisitID,MAX([SupervisorApproval]) as [SupervisorApproval]
            from [10.10.1.79\SQL_PG].GoldenShop.dbo.Visits 
            group by CustomerCode
        )
        SELECT 
            DT.[PG1],
            DT.[PG1ADI],
            DT.[PG2ADI],
            DT.[PG4ADI],
            DT.[MUSTERINO],
            DT.[UNVAN],
            DT.[DISTKODU],
            [PSEKODU], 
            [PROMOSYONSINIFI],
            [ODEMETIPI],
            [DURUMU],
            ISNULL(OZELLIKKODU, 0) AS [Golden],
			V.*
            
        FROM 
            [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT
        LEFT JOIN 
            [UniDATA].[dbo].MUSTERIOZELLIK MZ
        ON 
            MZ.MUSTERINO = DT.MUSTERINO
        inner JOIN 
            Attachments V
        ON 	
            DT.MUSTERINO = V.CustomerCode  COLLATE SQL_Latin1_General_CP1_CI_AS
        WHERE 
            ISNULL(OZELLIKKODU, 0) = '1'  
			--AND V.Flow='Supervisor'
			   AND DT.DISTKODU IN ({distkoduInClause});";

                var data = new List<Shop>();
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var shop = new Shop
                                {
                                    PG1 = reader["PG1"].ToString(),
                                    PG1ADI = reader["PG1ADI"].ToString(),
                                    PG2ADI = reader["PG2ADI"].ToString(),
                                    PG4ADI = reader["PG4ADI"].ToString(),
                                    MUSTERINO = reader["MUSTERINO"].ToString(),
                                    UNVAN = reader["UNVAN"].ToString(),
                                    DISTKODU = reader["DISTKODU"].ToString(),
                                    PSEKODU = reader["PSEKODU"].ToString(),
                                    PROMOSYONSINIFI = reader["PROMOSYONSINIFI"].ToString(),
                                    ODEMETIPI = reader["ODEMETIPI"].ToString(),
                                    DURUMU = reader["DURUMU"].ToString(),
                                    OZELLIKKODU = Convert.ToInt32(reader["Golden"]),
                                    Flow = reader["Flow"].ToString(),
                                    // VisitTime = reader["VisitDate"] == DBNull.Value ? null : ConvertToTehranTime((DateTime)reader["VisitDate"]),
                                     VisitID = reader["VisitID"] == DBNull.Value ? 0 : Convert.ToInt32(reader["VisitID"])
                                };
                                data.Add(shop);
                            }
                        }
                    }
                }
                return Ok(data);
            }
            if (user.IsInRole("Specialist"))
            {
            

                string connectionString = _configuration.GetConnectionString("PeraConnection");

                string query = $@"
             with Attachments as (
            select CustomerCode,MAX(Flow) AS Flow,Max(VisitID) AS VisitID,MAX([SupervisorApproval]) as [SupervisorApproval],MAX([MerchApproval]) as [MerchApproval]
            from [10.10.1.79\SQL_PG].GoldenShop.dbo.Visits 
            group by CustomerCode
        )
            SELECT 
            DT.[PG1],
            DT.[PG1ADI],
            DT.[PG2ADI],
            DT.[PG4ADI],
            DT.[MUSTERINO],
            DT.[UNVAN],
            DT.[DISTKODU],
            [PSEKODU], 
            [PROMOSYONSINIFI],
            [ODEMETIPI],
            [DURUMU],
            ISNULL(OZELLIKKODU, 0) AS [Golden],
			V.*
            
        FROM 
            [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT
        LEFT JOIN 
            [UniDATA].[dbo].MUSTERIOZELLIK MZ
        ON 
            MZ.MUSTERINO = DT.MUSTERINO
        inner JOIN 
            Attachments V
        ON 	
            DT.MUSTERINO = V.CustomerCode  COLLATE SQL_Latin1_General_CP1_CI_AS
        WHERE 
            ISNULL(OZELLIKKODU, 0) = '1'  
			AND V.Flow='Specialist' ;";

                var data = new List<Shop>();
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                       
                        connection.Open();
                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var shop = new Shop
                                {
                                    PG1 = reader["PG1"].ToString(),
                                    PG1ADI = reader["PG1ADI"].ToString(),
                                    PG2ADI = reader["PG2ADI"].ToString(),
                                    PG4ADI = reader["PG4ADI"].ToString(),
                                    MUSTERINO = reader["MUSTERINO"].ToString(),
                                    UNVAN = reader["UNVAN"].ToString(),
                                    DISTKODU = reader["DISTKODU"].ToString(),
                                    PSEKODU = reader["PSEKODU"].ToString(),
                                    PROMOSYONSINIFI = reader["PROMOSYONSINIFI"].ToString(),
                                    ODEMETIPI = reader["ODEMETIPI"].ToString(),
                                    DURUMU = reader["DURUMU"].ToString(),
                                    OZELLIKKODU = Convert.ToInt32(reader["Golden"]),
                                    Flow = reader["Flow"].ToString(),
                                   
                                    // VisitTime = reader["VisitDate"] == DBNull.Value ? null : ConvertToTehranTime((DateTime)reader["VisitDate"]),
                                     VisitID = reader["VisitID"] == DBNull.Value ? 0 : Convert.ToInt32(reader["VisitID"])
                                };
                                data.Add(shop);
                            }
                        }
                    }
                }

                return Ok(data);
            }
            return Ok();
        }

    [HttpGet("AllCustomer/{SUH}")]
    public async Task<ActionResult<IEnumerable<Shop>>> GetAllcustomer(int SUH)
    {       
            var user = User;
            var userName = user.Identity?.Name;
            if(userName == null)
            {
                return Unauthorized();
            }
     
                string connectionString = _configuration.GetConnectionString("PeraConnection");
            
                string query = $@"WITH FinalVisit AS (
    SELECT 
        CustomerCode, 
        SUHCode,
        Flow,
        MAX(VisitID) AS VisitID,
        MAX(VisitDate) AS VisitDate
    FROM 
        [10.10.1.79\SQL_PG].GoldenShop.dbo.Visits
    GROUP BY  
        SUHCode,
        Flow,
        CustomerCode
),
RankedData AS (
    SELECT 
        DT.[PG1],
        DT.[PG1ADI],
        DT.[PG2ADI],
        DT.[PG4ADI],
        DT.[MUSTERINO],
        DT.[UNVAN],
        DT.[DISTKODU],
        [PSEKODU], 
        [PROMOSYONSINIFI],
        [ODEMETIPI],
        [DURUMU],
        ISNULL(OZELLIKKODU, 0) AS [Golden],
        V.VisitDate,
        V.VisitID,
        V.Flow,
        ROW_NUMBER() OVER (PARTITION BY DT.MUSTERINO ORDER BY V.VisitDate DESC) AS RowNum
    FROM 
        [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT
    LEFT JOIN 
        [UniDATA].[dbo].MUSTERIOZELLIK MZ
    ON 
        MZ.MUSTERINO = DT.MUSTERINO
    FULL JOIN 
        FinalVisit V
    ON 
        DT.MUSTERINO = V.CustomerCode COLLATE SQL_Latin1_General_CP1_CI_AS
    WHERE 
        ISNULL(OZELLIKKODU, 0) = '1' 
    -- AND (V.VisitDate IS NULL OR CAST(V.VisitDate AS DATE) = CAST(GETDATE() AS DATE)) 
    AND DT.DISTKODU = {SUH}
)
SELECT 
    PG1,
    PG1ADI,
    PG2ADI,
    PG4ADI,
    MUSTERINO,
    UNVAN,
    DISTKODU,
    PSEKODU, 
    PROMOSYONSINIFI,
    ODEMETIPI,
    DURUMU,
    Golden,
    VisitDate,
    VisitID,
    Flow
FROM 
    RankedData
WHERE 
    RowNum = 1;";
                var data = new List<Shop>();
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var shop = new Shop
                                {
                                    PG1 = reader["PG1"].ToString(),
                                    PG1ADI = reader["PG1ADI"].ToString(),
                                    PG2ADI = reader["PG2ADI"].ToString(),
                                    PG4ADI = reader["PG4ADI"].ToString(),
                                    //MUSTERINO = Convert.ToInt32(reader["MUSTERINO"]),
                                    MUSTERINO = reader["MUSTERINO"].ToString(),
                                    UNVAN = reader["UNVAN"].ToString(),
                                    DISTKODU = reader["DISTKODU"].ToString(),
                                    PSEKODU = reader["PSEKODU"].ToString(),
                                    PROMOSYONSINIFI = reader["PROMOSYONSINIFI"].ToString(),
                                    ODEMETIPI = reader["ODEMETIPI"].ToString(),
                                    DURUMU = reader["DURUMU"].ToString(),
                                    OZELLIKKODU = Convert.ToInt32(reader["Golden"]),
                                    VisitTime = reader["VisitDate"] == DBNull.Value ? null : ConvertToTehranTime((DateTime)reader["VisitDate"]),
                                    VisitID = reader["VisitID"] == DBNull.Value ? 0 : Convert.ToInt32(reader["VisitID"]),
                                    Flow = reader["Flow"].ToString(),
                                };
                                data.Add(shop);
                            }
                        }
                    }
                }
                return Ok(data);
        }       
     [HttpGet("AllSUH")]
     public async Task<ActionResult<IEnumerable<Shop>>> GetAllSUH()
    {       
            var user = User;
            var userName ="uli\\"+ user.Identity?.Name;
           // userName = "uli\\yasaman.karimkhani";
            if (userName == null)
            {
                return Unauthorized();
            }

            string connectionString = _configuration.GetConnectionString("PeraConnection");
            string query ="";
            /*    string query = $@"
SELECT DISTINCT [PSEKODU]
FROM [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT 
LEFT JOIN [UniDATA].[dbo].MUSTERIOZELLIK 
ON MUSTERIOZELLIK.MUSTERINO = DT.MUSTERINO 
WHERE ISNULL(OZELLIKKODU, 0) = '1'
ORDER BY [PSEKODU]
          ";*/

            if (user.IsInRole("LDAPUser"))
            {
                query = $@"
SELECT DISTINCT DT.[DISTKODU]
FROM [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT 
WHERE EXISTS (
    SELECT 1 
    FROM [UniDATA].[dbo].MUSTERIOZELLIK M 
    WHERE M.MUSTERINO = DT.MUSTERINO 
    AND M.OZELLIKKODU = '1'
)
AND EXISTS (
    SELECT 1 
    FROM [UniDATA].[dbo].Distributor_Supervisors DS
    WHERE DT.[DISTKODU] = DS.[DISTKODU]
    AND ('{userName}' IN (DS.SV1, DS.SV2, DS.SV3, DS.SV4))
)
ORDER BY DT.[DISTKODU]
";
            }
            if (user.IsInRole("ASM"))
            {
                query = $@"
SELECT DISTINCT DT.[DISTKODU]
FROM [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT 
WHERE EXISTS (
    SELECT 1 
    FROM [UniDATA].[dbo].MUSTERIOZELLIK M 
    WHERE M.MUSTERINO = DT.MUSTERINO 
    AND M.OZELLIKKODU = '1'
)
AND EXISTS (
    SELECT 1 
    FROM [UniDATA].[dbo].Distributors_ASMs DS
    WHERE DT.[DISTKODU] = DS.[DISTKODU]
    AND ('{userName}' IN (DS.[ASM1], DS.[ASM2]))
)
ORDER BY DT.[DISTKODU]
";
            } 
            
            if (user.IsInRole("RSM"))
            {
                query = $@"
  SELECT DISTINCT DT.[DISTKODU]
FROM [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT 
WHERE EXISTS (
    SELECT 1 
    FROM [UniDATA].[dbo].MUSTERIOZELLIK M 
    WHERE M.MUSTERINO = DT.MUSTERINO 
    AND M.OZELLIKKODU = '1'
)
AND EXISTS (
    SELECT 1 
    FROM [UniDATA].[dbo].[Distributors_RSM] DS
    WHERE DT.[DISTKODU] = DS.[DISTKODU]
    AND  DS.[RSM_Account]='{userName}'
)
ORDER BY DT.[DISTKODU]
";

            }
            if (user.IsInRole("Specialist") || user.IsInRole("Admin"))
            {
                    query = $@"SELECT DISTINCT DT.[DISTKODU]
                                FROM [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT 
                                LEFT JOIN [UniDATA].[dbo].MUSTERIOZELLIK 
                                ON MUSTERIOZELLIK.MUSTERINO = DT.MUSTERINO 
                                WHERE ISNULL(OZELLIKKODU, 0) = '1'
                                ORDER BY DT.[DISTKODU]";
            }
                
                var data = new List<Shop>();
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                       
                        connection.Open();
                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var shop = new Shop
                                {
                                  //  PG1 = reader["PG1"].ToString(),
                                  //  PG1ADI = reader["PG1ADI"].ToString(),
                                  //  PG2ADI = reader["PG2ADI"].ToString(),
                                  //  PG4ADI = reader["PG4ADI"].ToString(),
                                 //   MUSTERINO = reader["MUSTERINO"].ToString(),
                                 //   UNVAN = reader["UNVAN"].ToString(),
                                   DISTKODU = reader["DISTKODU"].ToString(),
                                 //   PSEKODU = reader["PSEKODU"].ToString(),
                                  
                                   
                                    // VisitTime = reader["VisitDate"] == DBNull.Value ? null : ConvertToTehranTime((DateTime)reader["VisitDate"]),
                                 //    VisitID = reader["VisitID"] == DBNull.Value ? 0 : Convert.ToInt32(reader["VisitID"])
                                };
                                data.Add(shop);
                            }
                        }
                    }
                }
                return Ok(data);                
    }

     
        [HttpGet("{id:int}")]
    public async Task<ActionResult<IEnumerable<Shop>>> Get(int id)
        {

            var user = User;
            var userName = user.Identity.Name;
            string connectionString = _configuration.GetConnectionString("PeraConnection");
         //   if (user.IsInRole("Visitor"))
          //  {
                if (id == 0)
                {
                    return BadRequest("Id is blank.");
                }

                string musterino = id.ToString("D8");
                string query = $@"SELECT    DT.[PG1],
                                        DT.[PG1ADI],
                                        DT.[PG2ADI],
                                        DT.[PG4ADI],
                                        DT.[MUSTERINO],
                                        DT.[UNVAN],
                                        DT.[DISTKODU],
                                        [PSEKODU],
                                        [PROMOSYONSINIFI],
                                        [ODEMETIPI], 
                                        [DURUMU] ,
                                        isnull(OZELLIKKODU,0) [Golden]
                                        FROM [UniDATA].[dbo].[WF_CustomerCreation_Detail] DT 
                                        left join [UniDATA].[dbo].MUSTERIOZELLIK 
                                        on MUSTERIOZELLIK.MUSTERINO = DT.MUSTERINO 
                                        where isnull(OZELLIKKODU,0)='1' and DT.MUSTERINO='{musterino}'";

                var data = new List<Shop>();
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var shop = new Shop
                                {
                                    PG1 = reader["PG1"].ToString(),
                                    PG1ADI = reader["PG1ADI"].ToString(),
                                    PG2ADI = reader["PG2ADI"].ToString(),
                                    PG4ADI = reader["PG4ADI"].ToString(),
                                    //MUSTERINO = Convert.ToInt32(reader["MUSTERINO"]),
                                    MUSTERINO = reader["MUSTERINO"].ToString(),
                                    UNVAN = reader["UNVAN"].ToString(),
                                    DISTKODU = reader["DISTKODU"].ToString(),
                                    PSEKODU = reader["PSEKODU"].ToString(),
                                    PROMOSYONSINIFI = reader["PROMOSYONSINIFI"].ToString(),
                                    ODEMETIPI = reader["ODEMETIPI"].ToString(),
                                    DURUMU = reader["DURUMU"].ToString(),
                                    OZELLIKKODU = Convert.ToInt32(reader["Golden"])
                                };
                                data.Add(shop);
                            }
                        }
                    }
                }

                return Ok(data);
          //  }
            
        }
    private string ConvertToTehranTime(DateTime? utcDateTime)
        {
            if (utcDateTime == null)
                return string.Empty;

            //  TimeZoneInfo tehranTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Iran Standard Time");
            // DateTime tehranDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime.Value, tehranTimeZone);
            // return tehranDateTime.ToString("HH:mm:ss");  // فقط زمان را بر می‌گرداند
            return utcDateTime.Value.ToString("yyyy-M-d HH:mm:ss");
        }   
    private async Task<List<string>> GetDistkoduByUserAsync(string userName)
        {
            userName = @"uli\" + userName;
            string query = "SELECT DISTKODU FROM [UniDATA].[dbo].[Distributor_Supervisors] WHERE SV1 = @userName OR SV2 = @userName OR SV3 = @userName OR SV4 = @userName OR SV5 = @userName";

            List<string> distkoduList = new List<string>();

            using (SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("PeraConnection")))
            {
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@userName", userName);
                    await connection.OpenAsync();

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            distkoduList.Add(reader["DISTKODU"].ToString());
                        }
                    }
                }
            }
            return distkoduList;
        }
    }
}