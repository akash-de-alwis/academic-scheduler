import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';  

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        fullName,
        email,
        password,
        confirmPassword,
        role
      });
      localStorage.setItem('token', response.data.token); // Store JWT
      console.log(response.data.message);
      navigate('/login'); // Redirect to login after signup
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans">
      <header className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Academic Scheduler</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><Link to="/" className="hover:text-gray-200 transition-colors duration-200">Home</Link></li>
              <li><Link to="/LoginPage" className="hover:text-gray-200 transition-colors duration-200">Login</Link></li>
              <li><Link to="/AboutPage" className="hover:text-gray-200 transition-colors duration-200">About</Link></li>
              <li><Link to="/FAQPage" className="hover:text-gray-200 transition-colors duration-200">FAQs</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-auto transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-bold text-[#1B365D] text-center mb-6">Join Us</h2>
          <p className="text-gray-600 text-center mb-8">Sign up to start managing your academic schedules.</p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-[#F5F7FA] rounded-full p-1">
              <button
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${role === 'Student' ? 'bg-[#1B365D] text-white' : 'text-[#1B365D] hover:bg-gray-200'}`}
                onClick={() => setRole('Student')}
              >
                Student
              </button>
              <button
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${role === 'Staff' ? 'bg-[#1B365D] text-white' : 'text-[#1B365D] hover:bg-gray-200'}`}
                onClick={() => setRole('Staff')}
              >
                Staff
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#1B365D] mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1B365D] mb-1">
                {role === 'Student' ? 'Student Email' : 'Staff Email'}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-transparent transition-all duration-200"
                placeholder={`Enter your ${role.toLowerCase()} email`}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1B365D] mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-transparent transition-all duration-200"
                placeholder="Create a password"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1B365D] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-transparent transition-all duration-200"
                placeholder="Confirm your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#1B365D] text-white font-semibold py-3 rounded-lg hover:bg-[#2A4A7A] transition-all duration-300 shadow-md"
            >
              Sign Up as {role}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account? <Link to="/LoginPage" className="text-[#1B365D] font-medium hover:underline transition-colors duration-200">Log In</Link>
          </p>
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p className="mb-4">
            Need help? Check out our <Link to="/faq" className="text-[#1B365D] hover:underline">FAQs</Link> or contact support.
          </p>
        </div>
      </div>

      <footer className="bg-[#1B365D] text-white py-6">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Academic Scheduler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SignupPage;