'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { generateOTP, loginOtp } from '../services/apiService';
import VerifyAccount from './VerifyAccount';

interface LoginProps {
  redirectTo?: string;
}

const Login: React.FC<LoginProps> = ({ redirectTo = '/' }) => {
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [phoneForVerification, setPhoneForVerification] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Only send OTP request, do not call login API here
      // Assuming loginOtp with empty OTP sends OTP to phone

      await generateOTP(phoneCode+phoneNumber)
      
      toast.success('OTP sent to your phone', {
        style: {
          background: '#10B981',
          color: '#FFFFFF',
        },
      });
      setPhoneForVerification(phoneCode + phoneNumber);
      setStep('verify');
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

  const handleVerificationSuccess = async (user: any) => {
    console.log('User data received:', user);
    setLoading(true);
    try {
      if (user && user._id) {
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Login successful', {
          style: {
            background: '#10B981',
            color: '#FFFFFF',
          },
        });
        router.push(redirectTo=="/"?"/":"/"+redirectTo); // Use redirectTo prop here
      } else {
        toast.error('Login failed: Invalid user data', {
          style: {
            background: '#EF4444',
            color: '#FFFFFF',
          },
        });
      }
    } catch (error) {
      toast.error('Login failed', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100 flex flex-col justify-center ">
      <main className="flex-grow flex items-center justify-center p-2">
        <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md space-y-6 px-6 sm:px-10 mx-4 sm:mx-auto">
          {step === 'login' ? (
            <>
              <div className="mb-6 flex items-center space-x-2">
                <img src="./login-logo.png" alt="Logo" className="h-16" />
                <h1 className="text-2xl font-semibold">Login</h1>
              </div>
              <p className="mb-6 text-gray-600">Enter your phone number below to login to your account</p>
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="flex space-x-3">
                  <input
                  disabled
                    value={phoneCode}
                    
                    className="w-20 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
               
                  <input
                    type="tel"
                    maxLength={10}
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
                    'Get OTP'
                  )}
                </button>
              </form>
              {/* <p className="mt-6 text-center text-gray-600">
                Don't have an account? <a href="/create-account" className="font-semibold underline">Register</a>
              </p> */}
            </>
            ) : (
            <VerifyAccount phoneNumber={phoneForVerification} verifyApi={true} onVerified={handleVerificationSuccess} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
