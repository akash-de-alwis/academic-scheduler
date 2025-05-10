import React from 'react';
import { Link } from 'react-router-dom';

const MainHomePage = () => {
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
      <section className="bg-[#1B365D] text-white py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in">
            Plan Smarter, Learn Better
          </h2>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Your all-in-one solution for managing courses, timetables, rooms, and allocations with ease and precision.
          </p>
          <Link
            to="/LoginPage"
            className="inline-block bg-white text-[#1B365D] font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Modules Section */}
      <main className="container mx-auto py-16 px-4">
        <h3 className="text-3xl font-bold text-[#1B365D] text-center mb-12">
          Explore Our Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Module 1: Course & Subject Management */}
          <Link
            to="/subjectHome"
            className="bg-[#F5F7FA] p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-[#1B365D] text-white rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-[#1B365D] mb-2">
              Course & Subject
            </h4>
            <p className="text-gray-600">
              Manage courses with smart suggestions and prerequisite checks.
            </p>
          </Link>

          {/* Module 2: Timetable Management */}
          <Link
            to="/PublishTimetable"
            className="bg-[#F5F7FA] p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-[#1B365D] text-white rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-[#1B365D] mb-2">
              Timetable
            </h4>
            <p className="text-gray-600">
              Schedule classes without conflicts, auto-generated for efficiency.
            </p>
          </Link>

          {/* Module 3: Room & Facility Booking */}
          <Link
            to="/MeetingRoomBooking"
            className="bg-[#F5F7FA] p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-[#1B365D] text-white rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-[#1B365D] mb-2">
              Room Booking
            </h4>
            <p className="text-gray-600">
              Book facilities with no overlaps and smart alternatives.
            </p>
          </Link>

          {/* Module 4: Lecturer & Student Allocation */}
          <Link
            to="/BatchOverviewReport"
            className="bg-[#F5F7FA] p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-[#1B365D] text-white rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 1.857h10M7 10h10m0 0H7m10 0a3 3 0 01-3-3V5a3 3 0 016 0v2a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-[#1B365D] mb-2">
              Allocation
            </h4>
            <p className="text-gray-600">
              Assign lecturers and students with balanced workloads.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B365D] text-white py-6">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Academic Scheduler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainHomePage;