import React, { useState } from 'react';
import { Plus, X, CheckCircle, Circle, LogOut, Moon, Sun, Trash } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import PomodoroTimer from './PomodoroTimer'; // New import

const TasksPage = () => {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTask();
  const { logout } = useAuth();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addTask(newTaskTitle, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700'} relative`}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <a href="/" className="hover:text-gray-200">My Tasks</a>
        </h1>

        {/* Dark Mode and Pomodoro Toggle Buttons */}
        <div className="absolute top-6 right-6 flex gap-4">
          <button
            onClick={() => setShowPomodoro(!showPomodoro)}
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {showPomodoro ? 'Hide Timer' : 'Show Timer'}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Add New Task Button */}
        {!isAddingTask && (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full p-4 rounded-lg bg-white/10 text-white flex items-center justify-center gap-2 hover:bg-white/20 transition-colors mb-6"
          >
            <Plus size={20} />
            Add New Task
          </button>
        )}

        {/* Add Task Form */}
        {isAddingTask && (
          <form onSubmit={handleAddTask} className="bg-white/20 backdrop-blur-xl rounded-lg p-6 mb-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-100">New Task</h3>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="text-gray-200 hover:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="w-full mb-4 p-3 bg-white/10 border-2 border-transparent rounded-md focus:ring-2 focus:ring-indigo-500 text-white placeholder:text-gray-300"
              required
            />
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Task description (optional)"
              className="w-full mb-6 p-3 bg-white/10 border-2 border-transparent rounded-md focus:ring-2 focus:ring-indigo-500 text-white placeholder:text-gray-300"
              rows="4"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Task
            </button>
          </form>
        )}

        {/* Pomodoro Timer */}
        {showPomodoro && <PomodoroTimer />}

        {/* Task Lists */}
        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Incomplete Tasks */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Incomplete Tasks</h2>
              {incompleteTasks.map((task) => (
                <div key={task._id} className="bg-white/10 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateTask(task._id, { completed: !task.completed })}>
                      {task.completed ? <CheckCircle /> : <Circle />}
                    </button>
                    <div>
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Completed Tasks */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Completed Tasks</h2>
              {completedTasks.map((task) => (
                <div key={task._id} className="bg-white/10 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateTask(task._id, { completed: !task.completed })}>
                      {task.completed ? <CheckCircle /> : <Circle />}
                    </button>
                    <div>
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
      >
        <LogOut size={24} />
      </button>
    </div>
  );
};

export default TasksPage;