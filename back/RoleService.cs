using CDOP.Models;
using Microsoft.EntityFrameworkCore;

namespace CDOP
{
    public class RoleService : IRoleService
    {
        private readonly ApplicationDbContext _context;

        public RoleService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Role>> GetSupervisorRolesAsync()
        {
            // Replace with your database call
            return await _context.Roles.Where(role => role.IsForSupervisor).ToListAsync();
        }

        public async Task<IEnumerable<Role>> GetVisitorRolesAsync()
        {
            // Replace with your database call
            return await _context.Roles.Where(role => role.IsForVisitor).ToListAsync();
        }
    }
}
