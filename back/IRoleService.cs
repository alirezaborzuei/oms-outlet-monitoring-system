using CDOP.Models;

namespace CDOP
{
    public interface IRoleService
    {
        Task<IEnumerable<Role>> GetSupervisorRolesAsync();
        Task<IEnumerable<Role>> GetVisitorRolesAsync();
    }
}
