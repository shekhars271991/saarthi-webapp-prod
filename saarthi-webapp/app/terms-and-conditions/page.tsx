import React from 'react';
import Header from '../components/Header';

const TermsAndConditionsPage = () => {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
        <p className="text-gray-700 leading-relaxed">
          Please read these terms and conditions carefully before using our services.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.
          Nullam id dolor id nibh ultricies vehicula ut id elit.
        </p>
      </main>
    </>
  );
};

export default TermsAndConditionsPage;
