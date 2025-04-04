import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { token, logout } = useAuth(); // Use token to check authentication status
  const navigate = useNavigate();

  // Redirect to tasks page if user is logged in
  useEffect(() => {
    if (token) {
      navigate('/tasks', { replace: true }); // Navigate to tasks page if token is present
    }
  }, [token, navigate]); // Add token to dependencies to re-trigger on token change

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700 text-white px-6 py-8">
      <div className="flex flex-col justify-center items-center flex-grow text-center">
        <div className="flex items-center space-x-4 mb-6">
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide drop-shadow-lg">
            Welcome to Taskly
          </h1>
          <img src="/logo.png" alt="Logo" className="w-14 h-14" /> {/* Increased logo size */}
        </div>
        <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-90 font-light">
          Manage your tasks effortlessly with Taskly. Sign in or create an account to get started!
        </p>
        <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-8">
          <Link
            to="/login"
            className="px-10 py-4 rounded-lg bg-white text-indigo-700 font-semibold shadow-2xl hover:bg-indigo-50 hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-10 py-4 rounded-lg bg-indigo-700 text-white font-semibold shadow-2xl hover:bg-indigo-800 hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            Sign Up
          </Link>
        </div>
      </div>
      <footer className="text-sm text-center py-4 opacity-70 mt-auto w-full">
        <p>&copy; 2025 Taskly. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
