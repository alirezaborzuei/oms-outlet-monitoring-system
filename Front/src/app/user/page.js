'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { changePassword } from '@/lib/store/authSlice';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for the eye
import Layout from '@/components/Layout';
import AuthWrapper from '@/components/AuthWrapper';
import swal from 'sweetalert';
const ChangePassword = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth?.user);
  const token = useSelector(state => state.auth?.token);
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
   // console.log(token)
    if(token){
        const result = await dispatch(changePassword({
     // userId: user.id,
      token,
      oldPassword,
      newPassword,
    }));

    if (result.success) {
      setLoading(false);
      swal('.رمز شما با موفقعیت تغییر یافت');
      router.back();
    } else {
      setError(result.message || 'Failed to update password.');
    } 
    }
    setLoading(false);

   
  };

  const handleBack=()=>{
    router.back();
  }

  return (
    <Layout>
    <AuthWrapper>

   
    <div className="flex items-center justify-center  bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Change Password</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
        
        {/* Old Password */}
        <div className="mb-4 relative">
          <label className="block text-gray-700">Old Password</label>
          <input
            type={showOldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Old Password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute right-3 top-10 text-gray-600"
          >
            {showOldPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* New Password */}
        <div className="mb-4 relative">
          <label className="block text-gray-700">New Password</label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-10 text-gray-600"
          >
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="mb-4 relative">
          <label className="block text-gray-700">Confirm Password</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-10 text-gray-600"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      
        <button
          onClick={handlePasswordChange}
          className={`w-full py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} transition duration-200`}
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
        <button
          onClick={handleBack}
          className={`w-full py-2 mt-4 rounded-lg text-white bg-gray-500`}
         
        >
           Back
        </button>
        
      </div>
    </div>
    </AuthWrapper>
    </Layout>
  );
};

export default ChangePassword;
