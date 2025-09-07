'use client';

import React, { useEffect } from 'react';
import Login from '../../app/components/Login';
import Header from '../components/Header';

import { useSearchParams } from 'next/navigation';

const LoginPage = () => {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userStr = localStorage.getItem('user');
    if (userStr) {
    window.location.href= redirectTo=="/"?"/":"/"+redirectTo
      return;
    }},[])
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Login redirectTo={redirectTo} />
    </div>
  );
};

export default LoginPage;
