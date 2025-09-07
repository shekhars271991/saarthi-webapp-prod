'use client';

import React, { useEffect, Suspense } from 'react';
import Login from '../../app/components/Login';
import Header from '../components/Header';

import { useSearchParams } from 'next/navigation';

const LoginContent = () => {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userStr = localStorage.getItem('user');
    if (userStr) {
      window.location.href = redirectTo == "/" ? "/" : "/" + redirectTo;
      return;
    }
  }, [redirectTo]);

  return (
    <div className="min-h-screen bg-white">
      <Header/>
      <Login />
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
