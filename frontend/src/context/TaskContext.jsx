import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const fetchTasks = async () => {
        try {
            const response = await fetch('http://localhost:3001/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (title, description) => {
        try {
            const response = await fetch('http://localhost:3001/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description })
            });
            const newTask = await response.json();
            setTasks(prev => [newTask, ...prev]);
            return newTask;
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    };

    const updateTask = async (taskId, updates) => {
        try {
            const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });
            const updatedTask = await response.json();
            setTasks(prev => prev.map(task => 
                task._id === taskId ? updatedTask : task
            ));
            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await fetch(`http://localhost:3001/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setTasks(prev => prev.filter(task => task._id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (token) {
            fetchTasks();
        }
    }, [token]);

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            addTask,
            updateTask,
            deleteTask,
            fetchTasks
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTask = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
};