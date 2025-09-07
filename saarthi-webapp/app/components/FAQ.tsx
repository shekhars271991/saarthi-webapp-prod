'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const tabs = [
    'General',
    'Payment',
    'Booking',
    'Airport transfer',
    'City rental',
    'Outstation',
    'Policy'
  ];

  const faqData: Record<string, FAQItem[]> = {
    General: [
      {
        question: 'How can I book a ride?',
        answer: 'You can easily book a ride through our website, mobile app, or by calling our customer service line. Simply select your service type (Airport Transfer, Hourly Rental, Outstation), provide your details, and choose your preferred vehicle.'
      },
      {
        question: 'What areas do you currently serve?',
        answer: 'We currently serve major cities and their surrounding areas. Please check our coverage map on the website or contact our customer service for specific location availability.'
      },
      {
        question: 'What types of vehicles are available?',
        answer: 'We offer a wide range of vehicles including economy cars, premium sedans, SUVs, and luxury vehicles to suit your needs and budget.'
      }
    ],
    Payment: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, debit cards, digital wallets, and cash payments for your convenience.'
      }
    ],
    Booking: [
      {
        question: 'How far in advance can I book a ride?',
        answer: 'You can book a ride up to 30 days in advance through our website or mobile app.'
      }
    ],
    'Airport transfer': [
      {
        question: 'Do you provide flight tracking?',
        answer: 'Yes, we monitor your flight status and adjust pickup times accordingly to ensure you never miss your ride.'
      }
    ],
    'City rental': [
      {
        question: 'What is the minimum rental duration?',
        answer: 'The minimum rental duration for city rentals is 4 hours, with flexible hourly extensions available.'
      }
    ],
    Outstation: [
      {
        question: 'Are overnight charges applicable?',
        answer: 'Yes, overnight charges may apply for multi-day outstation trips. Please check our pricing details for specific rates.'
      }
    ],
    Policy: [
      {
        question: 'What is your cancellation policy?',
        answer: 'You can cancel your booking up to 1 hour before the scheduled pickup time without any charges. Cancellations within 1 hour may incur a small fee.'
      }
    ]
  };

  const currentFAQs = faqData[activeTab] || [];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h1 className="text-4xl font-[400] text-center text-gray-900 mb-12">FAQs</h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 ">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border border-[#BEC9C6] rounded-[8px] font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-orange-200 text-orange-800 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {currentFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;