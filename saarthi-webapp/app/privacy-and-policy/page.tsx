import React from 'react';
import Header from '../components/Header';

const PrivacyAndPolicyPage = () => {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Privacy and Policy</h1>
        <p className="text-gray-700 leading-relaxed">
          Your privacy is important to us. We are committed to protecting your personal information and ensuring transparency in how we use it.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </main>
    </>
  );
};

export default PrivacyAndPolicyPage;
