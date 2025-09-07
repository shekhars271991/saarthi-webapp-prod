import React from 'react';
import Header from '../components/Header';

const CancellationRefundPage = () => {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Cancellation & Refund</h1>
        <p className="text-gray-700 leading-relaxed">
          We understand that plans can change. Our cancellation and refund policy is designed to be fair and transparent.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
          Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam.
        </p>
      </main>
    </>
  );
};

export default CancellationRefundPage;
