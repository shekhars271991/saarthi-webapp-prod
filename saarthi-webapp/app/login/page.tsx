'use client';

import React, { useEffect, Suspense } from 'react';
import Login from '../../app/components/Login';
import Header from '../components/Header';

import { useSearchParams } from 'next/navigation';

const LoginContent = () => {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  console.log('Login page loaded with redirect parameter:', redirectTo);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userStr = localStorage.getItem('user');
    if (userStr) {
      // Handle redirect properly for already logged in users
      const targetUrl = redirectTo === '/' ? '/' : redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
      window.location.href = targetUrl;
      return;
    }
  }, [redirectTo]);

  return (
    <div className="min-h-screen bg-white">
      <Header/>
      <Login redirectTo={redirectTo} />
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;
