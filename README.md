# Marriott Hotel Reservation System

A professional, full-stack hotel reservation web application with guest management, room booking, and admin panel.

## Features

✅ Guest Reservation Form
✅ Real-time Room Availability
✅ Secure Payment Integration
✅ Admin Dashboard
✅ Email Notifications
✅ Responsive Design
✅ Database Management
✅ RESTful API

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Redux for state management
- Axios for HTTP requests
- React Hook Form for form validation

### Backend
- Node.js with Express.js
- PostgreSQL Database
- JWT Authentication
- Nodemailer for emails
- Environment variables with dotenv

### Deployment
- Docker containerization
- AWS/Heroku ready
- Nginx reverse proxy

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/nadeemdibbah-cpu/marriott-hotel-reservation.git
cd marriott-hotel-reservation

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create `.env` files in both backend and frontend directories (see `.env.example`).

### Running the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm start
```

Application will run at `http://localhost:3000`

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed endpoint documentation.

## Database Schema

See [DATABASE.md](./DATABASE.md) for database structure.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for hosting instructions.

## License

MIT
