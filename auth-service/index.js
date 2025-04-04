

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// User Model
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Task Model
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

// Auth Routes
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.status(201).json({ token });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Task Routes
// Create a new task
app.post('/tasks', authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        const task = new Task({
            title,
            description,
            userId: req.userId
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Error creating task' });
    }
});

// Get all tasks for a user
app.get('/tasks', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});

// Update a task
app.put('/tasks/:taskId', authMiddleware, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, completed } = req.body;

        const task = await Task.findOne({ _id: taskId, userId: req.userId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.completed = completed !== undefined ? completed : task.completed;

        await task.save();
        res.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Error updating task' });
    }
});

// Delete a task
app.delete('/tasks/:taskId', authMiddleware, async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findOneAndDelete({ _id: taskId, userId: req.userId });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Error deleting task' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        mongoConnection: mongoose.connection.readyState,
        database: mongoose.connection.name
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});