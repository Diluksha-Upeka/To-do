import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      login(data.token);
      navigate('/tasks');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-wide">
            Create your account
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 bg-red-100 border border-red-300 rounded-md p-3 text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm transition duration-200 ease-in-out transform hover:scale-105"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm transition duration-200 ease-in-out transform hover:scale-105"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
          >
            Sign up
          </button>
        </form>
        <div className="text-center">
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
      
    </div>
  );
}

export default Signup;
