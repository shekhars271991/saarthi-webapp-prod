'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { signup } from '../services/apiService';
import VerifyAccount from './VerifyAccount';

const CreateAccountPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'create' | 'verify'>('create');
  const [phoneForVerification, setPhoneForVerification] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      toast.error('Please enter a valid full name (at least 3 characters).', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
        },
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
        },
      });
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid phone number (10 digits).', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
        },
      });
      return;
    }

    setLoading(true);
    try {
      await signup(fullName, email, phoneCode + phoneNumber);
      toast.success('Signup successful, OTP sent to your phone', {
        style: {
          background: '#10B981',
          color: '#FFFFFF',
        },
      });
      setPhoneForVerification(phoneCode + phoneNumber);
      // setStep('verify');
      setTimeout(()=>{window.location.href="/login"},2000)
    } catch (error) {
      toast.error('Something went wrong', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    toast.success('Account verified successfully', {
      style: {
        background: '#10B981',
        color: '#FFFFFF',
      },
    });
    router.push('/login');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100 flex flex-col justify-center">
      <main className="flex-grow flex items-center justify-center p-2">
        <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md space-y-6 px-6 sm:px-10 mx-4 sm:mx-auto">
        
            <>
              <div className="mb-6 flex items-center space-x-2">
                <img src="./login-logo.png" alt="Logo" className="h-16" />
                <h1 className="text-2xl font-semibold">Create Account</h1>
              </div>
              <p className="mb-6 text-gray-600">Fill the information below to get started</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <div className="flex space-x-3">
                  <select
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="+91">+91</option>
                    <option value="+251">+251</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    {/* Add more country codes as needed */}
                  </select>
                  <input
                    type="tel"
                    style={{ width: '80%' }}
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="flex-grow border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-teal-700 text-white py-3 rounded-full hover:bg-teal-800 transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                        ></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Register'
                  )}
                </button>
              </form>
              <p className="mt-6 text-center text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-semibold underline">
                  Log In
                </a>
              </p>
            </>
         
        </div>
      </main>
    </div>
  );
};

export default CreateAccountPage;
