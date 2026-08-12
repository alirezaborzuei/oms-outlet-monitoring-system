/* import Link from 'next/link';
import UserInfo from './UserInfo';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-4 bg-blue-200 shadow-md">
        <Link href="./1">
          <div className="text-lg font-semibold hover:text-blue-600 transition duration-300">
            Unilever OMS
          </div>
        </Link>
        <UserInfo />   
      </header>
      <main className="flex-grow p-4 bg-gray-100">
        {children}
      </main>
      <footer className="p-4 bg-blue-200 text-center">
        © 2024 Unilever
      </footer>
    </div>
  );
};
export default Layout;
 */


import Link from 'next/link';
import UserInfo from './UserInfo';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

const Layout = ({ children }) => {
  const router = useRouter();
  const { role } = useSelector((state) => state.auth) || {};

  // Determine the main route based on the user's role
  const getMainRoute = () => {
    switch (role) {
      case 'LDAPUser':
        return '/DistCode';
      case 'Visitor':
        return '/listVisitor';
      case 'Specialist':
        return '/DistCode';
      case 'Admin':
        return '/DistCode';
      case 'RSM':
        return '/DistCode';
      case 'ASM':
        return '/DistCode';
      default:
        return '/login';  // Redirect to login if no role is found
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-4 bg-blue-200 shadow-md">
         <UserInfo />  <div
          className="text-lg font-semibold hover:text-blue-600 transition duration-300 cursor-pointer"
          onClick={() => router.push(getMainRoute())}  // Navigate to the main route
        >
          سامانه پایش فروشگاهی
        </div>
         {/* Display user info component */}
      </header>
      <main className="flex-grow p-4 bg-gray-100">
        {children}
      </main>
      <footer className="p-4 bg-blue-200 text-center">
        © 2024 Unilever
      </footer>
    </div>
  );
};

export default Layout;
