// config.js
require('dotenv').config();

const config = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    port: process.env.PORT || 3001
};

module.exports = config;