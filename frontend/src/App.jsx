import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Homepage from './components/HomePage';
import TasksPage from './components/TaskPage';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  if (!token) {
    return <Navigate to="/" replace />; // Redirect to homepage if token is missing
  }
  return children;
};

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <TaskProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected route for tasks */}
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </TaskProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
