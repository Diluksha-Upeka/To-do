import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // If already authenticated, redirect to homepage
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await login(data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-wide">
              Sign in to Taskly
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                create a new account
              </Link>
            </p>
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
                disabled={isLoading}
              />
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:text-sm transition duration-200 ease-in-out transform hover:scale-105"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
      <footer className="text-sm text-center py-4 text-gray-200">
        <p>&copy; 2025 Taskly. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Login;
