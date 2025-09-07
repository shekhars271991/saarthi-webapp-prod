'use client';

import React from 'react';
import CreateAccountPage from '../../app/components/CreateAccountPage';
import Header from '../components/Header';

const CreateAccount = () => {
  const handleRegister = () => {
    // Handle post-registration logic here, e.g., navigate to verify account page
  };
return (
    <div className="min-h-screen bg-white">
      <Header/>
      <CreateAccountPage onRegister={handleRegister} />
    </div>
  );

};

export default CreateAccount;
