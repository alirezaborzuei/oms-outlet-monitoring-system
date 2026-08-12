using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CDOP.Controllers
{
    
    [Authorize(Roles = "LDAPUser, Visitor")]
    public class RoleController : Controller
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        public async Task<IActionResult> Index()
        {
            var user = User;
            if (user.IsInRole("LDAPUser"))
            {
                var roles = await _roleService.GetSupervisorRolesAsync();
                return View("SupervisorRoles", roles);
            }
            else if (user.IsInRole("Visitor"))
            {
                var roles = await _roleService.GetVisitorRolesAsync();
                return View("VisitorRoles", roles);
            }

            // If the user is neither a Supervisor nor a Visitor, show an error or redirect
            return View("Error");
        }
    }

}
