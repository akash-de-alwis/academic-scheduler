import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
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

      {/* Hero Section */}
      <section className="bg-[#F5F7FA] py-20">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1B365D] mb-6 animate-fade-in">
            About Academic Scheduler
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Simplifying academic planning with innovative tools for courses, timetables, rooms, and allocations.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-[#1B365D] mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              We aim to streamline the academic experience by providing a robust, user-friendly platform that empowers students, lecturers, and administrators to manage schedules efficiently. Our tools are designed to eliminate conflicts, optimize resources, and enhance productivity.
            </p>
          </div>
          <div className="bg-[#1B365D] text-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <h4 className="text-2xl font-semibold mb-4">Why We Exist</h4>
            <p>
              To transform the chaos of academic scheduling into a seamless process, ensuring every class, room, and person is perfectly aligned.
            </p>
          </div>
        </div>
      </section>

      {/* Features Highlights */}
      <section className="bg-[#F5F7FA] py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-[#1B365D] text-center mb-12">What We Offer</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-[#1B365D] text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#1B365D] text-center mb-2">Course Management</h4>
              <p className="text-gray-600 text-center">Effortlessly manage courses and subjects with smart tools.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-[#1B365D] text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#1B365D] text-center mb-2">Timetable Planning</h4>
              <p className="text-gray-600 text-center">Schedule classes without conflicts, automatically.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-[#1B365D] text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 1.857h10M7 10h10m0 0H7m10 0a3 3 0 01-3-3V5a3 3 0 016 0v2a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#1B365D] text-center mb-2">Allocations</h4>
              <p className="text-gray-600 text-center">Assign lecturers and students with precision.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white py-16">
        <div className="container mx-auto text-center px-4">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-6">Join us in making academic planning effortless and efficient.</p>
          <Link
            to="/login"
            className="inline-block bg-white text-[#1B365D] font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md"
          >
            Log In Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B365D] text-white py-6">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Academic Scheduler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;