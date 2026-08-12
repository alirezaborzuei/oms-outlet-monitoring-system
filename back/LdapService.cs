using Novell.Directory.Ldap;
namespace CDOP
{

    public class LdapService
    {
        private readonly string _ldapHost;
        private readonly int _ldapPort;
        private readonly string _searchBase;
        private readonly string _adminDn;
        private readonly string _adminPassword;

        public LdapService(IConfiguration configuration)
        {
            _ldapHost = configuration["Ldap:Host"];
            _ldapPort = int.Parse(configuration["Ldap:Port"]);
            _searchBase = configuration["Ldap:SearchBase"];
            _adminDn = configuration["Ldap:AdminDn"];
            _adminPassword = configuration["Ldap:AdminPassword"];
        }

        public bool Authenticate(string username, string password)
        {
            try
            {
                using (var ldapConnection = new LdapConnection())
                {
                    ldapConnection.Connect(_ldapHost, _ldapPort);
                    ldapConnection.Bind(_adminDn, _adminPassword);

                    var searchFilter = $"(sAMAccountName={username})";
                    var searchResults = ldapConnection.Search(
                        _searchBase,
                        LdapConnection.ScopeSub,//??? .SCOPE_SUB,
                        searchFilter,
                        null,
                        false
                    );

                    if (searchResults.HasMore())
                    {
                        var user = searchResults.Next();
                        var userDn = user.Dn;
                        ldapConnection.Bind(userDn, password);
                        return ldapConnection.Bound;
                    }
                }
            }
            catch (LdapException)
            {
                return false;
            }

            return false;
        }
    }
}



/*
using System.DirectoryServices;
using System.Runtime.InteropServices;
using DirectoryEntry = System.DirectoryServices.DirectoryEntry;

namespace CDOP
{
    public class LdapService
    {
        private string ldapHost = "10.10.1.12";
        private int ldapPort = 389;
        private string searchBase = "DC=ULI,DC=com";
        private string adminDn = "ULI\\alireza.borzouei";
        private string adminPassword = "Qazwsx1111@";

        public bool Authenticate(string username, string password)
        {
            try
            {
                // Create a DirectoryEntry object for the LDAP connection
                using (DirectoryEntry entry = new DirectoryEntry($"LDAP://{ldapHost}:{ldapPort}/{searchBase}", adminDn, adminPassword))
                {
                    // Create a DirectorySearcher object
                    using (DirectorySearcher searcher = new DirectorySearcher(entry))
                    {
                        // Specify the filter to find the user
                        searcher.Filter = $"(&(objectClass=user)(sAMAccountName={username}))";
                        searcher.SearchScope = SearchScope.Subtree;

                        // Execute the search
                        SearchResult result = searcher.FindOne();

                        // If user found, validate password
                        if (result != null)
                        {
                            try
                            {
                                using (DirectoryEntry userEntry = result.GetDirectoryEntry())
                                {
                                    // Validate the user credentials by binding with the provided username and password
                                    using (DirectoryEntry user = new DirectoryEntry(userEntry.Path, username, password))
                                    {
                                        // Attempt to access a property to verify credentials
                                        object nativeObject = user.NativeObject;
                                        return true; // Authentication successful
                                    }
                                }
                            }
                            catch (COMException)
                            {
                                return false; // Authentication failed
                            }
                        }
                    }
                }
            }
            catch (DirectoryServicesCOMException ex)
            {
                Console.WriteLine($"DirectoryServicesCOMException: {ex.Message}");
                return false; // Authentication failed
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return false;
            }

            return false; // User not found
        }

    }

}
*/



/*using System.DirectoryServices.Protocols;
using System.Net;

namespace CDOP
{
    public class LdapService
    {
        private string ldapHost = "10.10.1.12";
        private int ldapPort = 389;
        private string searchBase = "DC=ULI,DC=com";

        *//*  public bool Authenticate(string username, string password)
          {
              try
              {
                  // Create a LdapConnection object
                  using (var ldapConnection = new System.DirectoryServices.Protocols.LdapConnection(new LdapDirectoryIdentifier(ldapHost, ldapPort)))
                  {
                      // Bind with the provided username and password
                      ldapConnection.Credential = new NetworkCredential(username, password);
                     // ldapConnection.SaslMechanism = null; // Use default mechanism

                      // Attempt to bind to the LDAP server
                      ldapConnection.Bind();

                      // If binding is successful, the user is authenticated
                      return true;
                  }
              }
              catch (System.DirectoryServices.Protocols.LdapException ex)
              {
                  Console.WriteLine($"LdapException: {ex.Message}");
                  return false; // Authentication failed
              }
              catch (Exception ex)
              {
                  Console.WriteLine($"Error: {ex.Message}");
                  return false; // Authentication failed
              }
          }*//*

        public bool Authenticate(string username, string password)
        {
            try
            {
                using (var ldapConnection = new LdapConnection(new LdapDirectoryIdentifier(ldapHost, ldapPort)))
                {
                    ldapConnection.Credential = new NetworkCredential(username, password);
                    ldapConnection.Bind(); // Attempt to bind
                    return true; // Authentication successful
                }
            }
            catch (LdapException ex)
            {
                Console.WriteLine($"LdapException: {ex.Message}");
                return false; // Authentication failed
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return false; // Authentication failed
            }
        }

    }
}*/


/*using System;
using System.DirectoryServices.Protocols;
using System.Net;
using Microsoft.Extensions.Configuration;

namespace CDOP
{
    public class LdapService
    {
        private readonly string _ldapHost;
        private readonly int _ldapPort;
        private readonly string _searchBase;

        public LdapService(IConfiguration configuration)
        {
            _ldapHost = configuration["Ldap:Host"];
            _ldapPort = int.Parse(configuration["Ldap:Port"]);
            _searchBase = configuration["Ldap:SearchBase"];
        }

        public bool Authenticate(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                Console.WriteLine("Username or password is empty or invalid.");
                return false;
            }

            try
            {
                using (var ldapConnection = new LdapConnection(new LdapDirectoryIdentifier(_ldapHost, _ldapPort)))
                {
                    ldapConnection.Credential = new NetworkCredential(username, password);
                    ldapConnection.Bind(); // Attempt to bind (authenticate)
                    Console.WriteLine("Authentication successful.");
                    return true;
                }
            }
            catch (TypeInitializationException ex)
            {
                Console.WriteLine($"Type initialization error: {ex.InnerException?.Message}");
                return false;
            }
            catch (LdapException ex)
            {
                Console.WriteLine($"LDAP authentication failed: {ex.Message}"); return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred during authentication: {ex.Message}"); return false;
            }

        } 
    }
}*/



/*using System;
using System.DirectoryServices;

namespace CDOP
{
    public class LdapService
    {
        private readonly string _ldapPath;

        public LdapService(IConfiguration configuration)
        {
            _ldapPath = configuration["LDAP://10.10.1.12/DC=uli,DC=com"];
        }

        public bool Authenticate(string username, string password)
        {
            try
            {
                using (var entry = new DirectoryEntry(_ldapPath, username, password))
                {
                    // Attempt to access the directory entry
                    var nativeObject = entry.NativeObject;
                    Console.WriteLine("Authentication successful.");
                    return true;
                }
            }
            catch (DirectoryServicesCOMException ex)
            {
                Console.WriteLine($"LDAP authentication failed: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred during authentication: {ex.Message}");
                return false;
            }
        }
    }
}
*/


/*
using Novell.Directory.Ldap;

namespace CDOP
{
    public class LdapService
    {
        private readonly string _ldapHost = "10.10.1.12";
        private readonly int _ldapPort = 389; // Typically 389 for LDAP or 636 for LDAPS

        public bool Authenticate(string username, string password)
        {
            try
            {
                using (var connection = new LdapConnection())
                {
                    connection.Connect(_ldapHost, _ldapPort);
                    connection.Bind($"samaccountname={username},ou=users,dc=uli,dc=com", password);
                    return true; // Authentication successful
                }
            }
            catch (LdapException ex)
            {
                Console.WriteLine($"{ex.Message}");
                return false; // Authentication failed
            }
        }
    }
}
*/