import React from 'react';
import Header from '../components/Header';

const AboutUsPage = () => {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">About Us</h1>
        <p className="text-gray-700 leading-relaxed">
          Welcome to our company. We are dedicated to providing the best services to our customers.
          Our mission is to deliver quality and satisfaction in every interaction.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam scelerisque aliquam odio et faucibus.
          Nulla rhoncus feugiat eros quis consectetur.
        </p>
      </main>
    </>
  );
};

export default AboutUsPage;
