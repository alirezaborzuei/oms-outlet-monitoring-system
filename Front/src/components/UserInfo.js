
'use client';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../lib/store/authSlice'; // Ensure correct path to authSlice
import { useRouter } from 'next/navigation';

const UserInfo = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.user);
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const role = useSelector(state => state.auth?.role);
 // const token = useSelector(state => state.auth.token);
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    // Dispatch action to clear authentication state
    dispatch(logout());
    
    // Redirect to login page or any other desired route after logout
    router.push('/login'); // Adjust the route as per your application
  };
  const handleUser =()=>{
    router.push('/user'); 
  }

  if (!user) {
    return null; // Render nothing if user is not logged in
  }

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 p-2 rounded-lg shadow-md cursor-pointer" onClick={toggleDropdown}>
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
          <span className="text-sm font-semibold">{user.sub[0]}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-gray-800">{user.sub}</span>
        </div>
      </div>
      {showDropdown && (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
        {role =='Visitor' && ( <button 
            onClick={handleUser} 
            className="block w-full text-right px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
          >
            تغییر رمز
          </button>)}
            <button 
            onClick={handleLogout} 
            className="block w-full text-right px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
          >
            خروج
          </button>
          {/* Add more options as needed */}
        </div>
      )}
    </div>
  );
};

export default UserInfo;