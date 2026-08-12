'use client';

import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { login } from '@/lib/store/authSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import the Image component
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for the eye
const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await dispatch(login({ username, password, rememberMe }));
    if (result.success) {
      // Redirect based on role after successful login
      switch (result.role) {
        case 'LDAPUser':
        case 'ASM':
        case 'RSM':
        case 'Specialist':
        case 'Admin':
          router.push('/DistCode');
          break;
        case 'Visitor':
          router.push('/listVisitor');
          break;
        default:
          router.push('/login');
          break;
      }
    } else {
      setError(result.message || 'Login failed. Please check your username and password.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        {/* Add Image here */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png" // Image path in the public folder
            alt="OMS Logo"
            width={600}
            height={400}
          />

        </div>
        {/* <h1 className="text-2xl font-bold mb-6 text-center">Unilever OMS</h1> */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Login</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="mb-4">
          {/*  <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          /> */}
        </div>

        <div className="mb-4 relative">
          <label className="block text-gray-700">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-gray-600"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="mb-6 flex items-center">
          <label className="flex items-center text-gray-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            Remember Me
          </label>
        </div>

        <button
          onClick={handleLogin}
          className={`w-full py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} transition duration-200`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/forgot-password')}
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
