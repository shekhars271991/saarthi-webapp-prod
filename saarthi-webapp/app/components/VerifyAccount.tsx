'use client';

import React, { useState, useRef, useEffect } from 'react';
import { verifyOtp, generateOTP } from '../services/apiService';
import { toast } from 'react-hot-toast';

const VerifyAccount = ({ phoneNumber, verifyApi, onVerified }: { phoneNumber: string; verifyApi: boolean; onVerified: (otp: string) => void }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    inputsRef.current[0]?.focus();
    setTimer(30);
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    if (index === 0) {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').trim();
      // Ensure the pasted data is exactly 6 digits
      if (/^\d{6}$/.test(pastedData)) {
        const newOtp = pastedData.split('').slice(0, 6); // Take first 6 digits
        setOtp(newOtp);
        inputsRef.current[5]?.focus(); // Focus on the last input
        // Optionally auto-submit if all digits are filled
        if (newOtp.every(digit => digit !== '')) {
          handleSubmit(new Event('submit') as any);
        }
      } else {
        toast.error('Please paste a valid 6-digit OTP (e.g., 655526)');
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every((digit) => digit !== '')) {
      setLoading(true);
      try {
        const otpCode = otp.join('');
        let user = null;
        if (verifyApi) {
          user = await verifyOtp(phoneNumber, otpCode);
        }
        onVerified(user?.user_details);
      } catch (error) {
        toast.error('OTP verification failed', {
          style: {
            background: '#EF4444',
            color: '#FFFFFF',
          },
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log("")
      // toast.error('Please enter the complete 6-digit code.');
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await generateOTP(phoneNumber);
      toast.success('OTP resent to your phone');
      setTimer(30);
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-sm space-y-6 mx-4 sm:mx-auto">
      <div className="mb-6 flex items-center space-x-2">
        <img src="./login-logo.png" alt="Logo" className="h-16" />
        <h1 className="text-2xl font-semibold">Verify account</h1>
      </div>
      <p className="mb-6 text-gray-600">
        Enter 6-digit code sent to your phone number via WhatsApp
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 ml-[-2rem] md:ml-[0rem]">
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(e, index)}
              ref={(el) => { inputsRef.current[index] = el; }}
              className="w-12 h-14 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          ))}
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
            'Verify OTP'
          )}
        </button>
      </form>
      <div className="mt-6 text-center text-gray-600">
        {timer > 0 ? (
          <span>
            Resend the code in <strong>{timer}S</strong>
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className={`bg-teal-700 text-white px-4 py-2 rounded-full hover:bg-teal-800 transition-colors font-medium text-sm ${
              resendLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {resendLoading ? (
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
                Sending...
              </span>
            ) : (
              'Resend OTP'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;