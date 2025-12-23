# SponzoBD Backend

Backend server for SponzoBD - A sponsorship platform built with Node.js, Express, and MongoDB.

## Features

- User authentication (Sponsors and Sponsees)
- JWT-based token authentication
- Password hashing with bcrypt
- MongoDB database
- RESTful API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/sponsozbd
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

## Running the Server

### Development mode (with hot reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Sponsor Authentication

- **POST** `/api/auth/sponsor/register` - Register a new sponsor

  ```json
  {
    "companyName": "Tech Corp",
    "email": "sponsor@example.com",
    "password": "password123",
    "phone": "1234567890",
    "industry": "Technology",
    "location": "New York",
    "description": "We sponsor tech events",
    "budget": 50000,
    "focusAreas": ["Education", "Innovation"],
    "website": "https://example.com"
  }
  ```

- **POST** `/api/auth/sponsor/login` - Login as sponsor
  ```json
  {
    "email": "sponsor@example.com",
    "password": "password123"
  }
  ```

### Sponsee Authentication

- **POST** `/api/auth/sponsee/register` - Register a new sponsee

  ```json
  {
    "eventName": "Tech Summit 2024",
    "email": "event@example.com",
    "password": "password123",
    "contactPerson": "John Doe",
    "phone": "1234567890",
    "organization": "Tech Events Inc",
    "location": "New York",
    "description": "Annual tech conference",
    "expectedAttendees": 1000,
    "eventType": ["Conference", "Workshop"],
    "categories": ["Technology", "Business"],
    "budget": 100000,
    "website": "https://event.com"
  }
  ```

- **POST** `/api/auth/sponsee/login` - Login as sponsee
  ```json
  {
    "email": "event@example.com",
    "password": "password123"
  }
  ```

## MongoDB Connection

If using MongoDB locally, make sure you have MongoDB running:

```bash
# On Windows (if MongoDB is installed as a service)
mongod

# Or using Docker:
docker run -d -p 27017:27017 --name mongodb mongo
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── Sponsor.js           # Sponsor schema
│   └── Sponsee.js           # Sponsee schema
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   └── auth.js              # JWT and authentication middleware
├── routes/
│   └── auth.js              # Auth endpoints
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── server.js               # Main server file
└── package.json            # Dependencies
```

## Security Notes

1. Change the `JWT_SECRET` in `.env` to a strong, random value for production
2. Use HTTPS in production
3. Implement rate limiting for login/registration endpoints
4. Consider using environment-specific configurations
5. Never commit `.env` file to version control

## Next Steps

- Add email verification
- Implement password reset functionality
- Add role-based access control (RBAC)
- Create sponsor/sponsee profile endpoints
- Implement sponsorship request system
