# Frontend-Backend Integration Complete

## Status: ✅ CONNECTED

The frontend signup and login pages are now fully integrated with the backend API.

## How It Works

### Login Page (login.html)

When a user submits the login form:

1. Collects email, password, and role (sponsor/sponsee)
2. Sends POST request to backend: `http://localhost:5000/api/auth/sponsor/login` or `/api/auth/sponsee/login`
3. Backend validates credentials and returns JWT token
4. Frontend stores token and user data in localStorage
5. Redirects to appropriate profile page

### Sponsor Signup (sponsor-signup.html)

When a sponsor submits registration:

1. Validates form fields on frontend
2. Sends POST request to: `http://localhost:5000/api/auth/sponsor/register`
3. Backend creates sponsor account with hashed password
4. Returns JWT token and user data
5. Frontend stores auth token and redirects to sponsor-profile.html

### Sponsee Signup (sponsee-signup.html)

When a sponsee submits registration:

1. Validates form fields on frontend
2. Sends POST request to: `http://localhost:5000/api/auth/sponsee/register`
3. Backend creates sponsee account with hashed password
4. Returns JWT token and user data
5. Frontend stores auth token and redirects to sponsee-profile.html

## Data Stored in localStorage

After successful login/signup:

- `authToken` - JWT token for API authentication
- `userRole` - 'sponsor' or 'sponsee'
- `userName` - Company name or event name
- `userId` - User ID from database

## API Endpoints

### Sponsor Routes

```
POST /api/auth/sponsor/register
POST /api/auth/sponsor/login
```

### Sponsee Routes

```
POST /api/auth/sponsee/register
POST /api/auth/sponsee/login
```

## To Test

1. **Start the backend server:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Make sure MongoDB is running**

3. **Open frontend pages:**

   - Sign up: Go to Navbar → Sign Up → Select role
   - Login: Go to Navbar → Login

4. **Test credentials:**
   - Create account via signup
   - Or test with login

## Error Handling

- Network errors are caught and displayed to user
- Backend validation errors are shown in error messages
- Duplicate email registrations are rejected
- Password validation is enforced (minimum 6 characters)

## Security Features

- Passwords are hashed with bcrypt before storage
- JWT tokens are issued on successful login
- CORS is enabled for frontend-backend communication
- Form validation on both frontend and backend

## Navbar Integration

The navbar.js file checks localStorage for `userRole`:

- Not logged in → Shows Home, About, Contact + Login/Sign Up
- Logged in as Sponsor → Shows Home, Sponsors, About, Contact + Profile/Logout
- Logged in as Sponsee → Shows Home, Events, About, Contact + Profile/Logout

## Next Steps

1. Create profile endpoints to fetch and display user data
2. Add email verification
3. Implement password reset functionality
4. Create sponsorship request system
5. Add sponsor-sponsee matching algorithm
