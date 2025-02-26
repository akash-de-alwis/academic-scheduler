import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Academic Scheduler?",
      answer: "Academic Scheduler is a modern tool designed to simplify academic planning by managing courses, timetables, rooms, and allocations efficiently for students and staff."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up or log in via the homepage, choose your role (Student or Staff), and start exploring the features tailored to your needs."
    },
    {
      question: "Can I use it on my phone?",
      answer: "Yes! Academic Scheduler is fully responsive, so you can manage your schedules seamlessly on any device—phone, tablet, or desktop."
    },
    {
      question: "What happens if I forget my password?",
      answer: "No worries! Click 'Forgot Password?' on the login page, and we’ll guide you through resetting it with your registered email."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We prioritize security with encrypted data storage and strict access controls to keep your information safe."
    },
    {
      question: "Can I suggest new features?",
      answer: "We’d love to hear from you! Reach out via the contact page (coming soon) or tweet us @AcademicScheduler with your ideas."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation Bar */}
      <header className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white p-6 shadow-lg sticky top-0 z-10">
              <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Academic Scheduler</h1>
                <nav>
                  <ul className="flex space-x-6">
                    <li>
                      <Link to="/" className="hover:text-gray-200 transition-colors duration-200">Home</Link>
                    </li>
                    <li>
                      <Link to="/LoginPage" className="hover:text-gray-200 transition-colors duration-200">Login</Link>
                    </li>
                    <li>
                      <Link to="/AboutPage" className="hover:text-gray-200 transition-colors duration-200">About</Link>
                    </li>
                    <li>
                      <Link to="/FAQPage" className="hover:text-gray-200 transition-colors duration-200">FAQs</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>

      {/* Main Content */}
      <main className="container mx-auto py-16 px-4">
        {/* Hero Section */}
        <section className="bg-[#F5F7FA] py-12 rounded-xl text-center mb-12">
          <h2 className="text-4xl font-extrabold text-[#1B365D] mb-4 animate-fade-in-up">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Got questions? We’ve got answers. Explore the FAQs below to learn more about Academic Scheduler.
          </p>
        </section>

        {/* FAQ Accordion */}
        <section className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 flex justify-between items-center text-left focus:outline-none"
              >
                <h3 className="text-xl font-semibold text-[#1B365D]">{faq.question}</h3>
                <span className="text-[#1B365D] transition-transform duration-300">
                  <svg
                    className={`w-6 h-6 ${openFAQ === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === index ? 'max-h-40 p-6 border-t border-gray-200' : 'max-h-0'
                }`}
              >
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Call to Action */}
        <section className="text-center mt-12">
          <p className="text-gray-700 mb-4">Still have questions?</p>
          <Link
            to="/login"
            className="inline-block bg-[#1B365D] text-white font-semibold py-4 px-10 rounded-full hover:bg-[#2A4A7A] transition-all duration-300 shadow-lg animate-bounce-slow"
          >
            Get in Touch
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B365D] text-white py-8">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Academic Scheduler. Built for the modern academic.</p>
        </div>
      </footer>
    </div>
  );
};

export default FAQPage;