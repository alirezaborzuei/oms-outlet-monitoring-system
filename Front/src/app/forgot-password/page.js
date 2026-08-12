/* 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/config';
import Swal from 'sweetalert'; // Import SweetAlert
const ForgotPassword = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      Swal.fire('Error', 'Please enter your username.', 'error');
      return;
    }

    setLoading(true);

    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        
        swal("Success", "رمز جدید برای تلفن شما ارسال شد", "success")
       // Swal( 'A link to reset your password has been sent to your phone.')
        // Optionally redirect or clear the input
        setUsername('');
      } else {
        // Show error message
        swal("Error", data.message || 'Failed to send reset link.', "error");
       
      }
    } catch (error) {
      console.error(error);
      
      swal("Error", "خطا در ارتباط با سرور", "error");
      
    } finally {
      setLoading(false);
    }
  };

  const handleBack=()=>{
    router.back();
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition duration-200"
          >
            Submit
          </button> 
              <button
              onClick={handleBack}
            type="submit"
            className="w-full py-2 mt-5 rounded-lg text-white bg-gray-500 hover:bg-gray-600 transition duration-200"
          >
            Back
          </button>
        </form>
   
      </div>
    </div>
  );
};

export default ForgotPassword;
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/config';
import Swal from 'sweetalert'; // Import SweetAlert

const ForgotPassword = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      Swal('Error', 'Please enter your username.', 'error');
      return;
    }

    setLoading(true);

    try {
      // Request for new password
      const response = await fetch(`${API}/Account/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        const newPassword = data.newPassword; // Assuming the response contains a newPassword field
        console.log(data.phoneNumber)
        const phoneNumber = data.phoneNumber; // Assuming the response contains a phoneNumber field
        //const phoneNumber = "9368076164"; // Assuming the response contains a phoneNumber field

        // Send the new password to the SMS service
        const smsResponse = await fetch(`https://she.unilever.ir:5335/smsReceived.asmx/Send_SMS_OMS?_receiver=${phoneNumber}&_message=${newPassword}`, {
          method: 'GET', // Assuming it's a GET request based on the provided URL
        });

        if (smsResponse.ok) {
          Swal("Success", "رمز جدید برای تلفن شما ارسال شد", "success");
        } else {
          Swal("Error", "Failed to send SMS.", "error");
        }

        // Optionally redirect or clear the input
        setUsername('');
      } else {
        // Show error message
        Swal("Error", data.message || 'Failed to send reset link.', "error");
      }
    } catch (error) {
      console.error(error);
      Swal("Error", "خطا در ارتباط با سرور", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition duration-200"
          >
            Submit
          </button> 
          <button
            onClick={handleBack}
            type="button" // Changed to button type to prevent form submission
            className="w-full py-2 mt-5 rounded-lg text-white bg-gray-500 hover:bg-gray-600 transition duration-200"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
