# MERN Stack Todo Application

A full-stack todo application built with the MERN stack (MongoDB, Express.js, React, Node.js) and containerized with Docker.

## Features

- User authentication (signup/login)
- Create, read, update, and delete todos
- JWT-based authentication
- Responsive frontend with Tailwind CSS
- Containerized with Docker
- MongoDB Atlas integration

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- MongoDB Atlas account (for production)

## Project Structure

```
.
├── frontend/          # React frontend application
├── auth-service/      # Node.js authentication service
├── docker-compose.yml # Docker Compose configuration
└── .env              # Environment variables (not in repo)
```

## Getting Started

1. Clone the repository:
```bash
git clone <your-repository-url>
cd <repository-name>
```

2. Create a `.env` file in the root directory with the following variables:
```
MONGODB_ATLAS_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
```

3. Build and start the containers:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:80
- Auth Service: http://localhost:3001

## API Endpoints

### Authentication
- POST /signup - Create a new user
- POST /login - Authenticate a user
- GET /health - Check service health

### Tasks
- POST /tasks - Create a new task (requires authentication)
- GET /tasks - Get all tasks (requires authentication)
- PUT /tasks/:taskId - Update a task (requires authentication)
- DELETE /tasks/:taskId - Delete a task (requires authentication)

## Development

### Frontend
- Built with React and Vite
- Styled with Tailwind CSS
- Hot reloading enabled

### Auth Service
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication

## Docker Commands

- Start containers: `docker-compose up`
- Stop containers: `docker-compose down`
- Rebuild containers: `docker-compose up --build`
- View logs: `docker-compose logs`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

nodemon index.js ------------- START THE AUTH SERVICE SERVER

npm run dev ------------------ START THE FRONTEND
