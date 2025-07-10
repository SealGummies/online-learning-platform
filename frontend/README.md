# Online Learning Platform - Frontend

This is a simple frontend for the Online Learning Platform built with HTML, CSS, and vanilla JavaScript.

## Features

- User Login/Registration
- Simple authentication with JWT tokens
- Dashboard with "Development in Progress" message
- Responsive design
- Clean and modern UI

## Pages

1. **Login Page** (`index.html`) - User authentication
2. **Register Page** (`register.html`) - New user registration
3. **Dashboard** (`dashboard.html`) - Post-login landing page

## File Structure

```
frontend/
├── index.html          # Login page
├── register.html       # Registration page
├── dashboard.html      # Dashboard page
├── css/
│   └── style.css      # All styles
└── js/
    ├── auth.js        # Authentication logic
    └── dashboard.js   # Dashboard functionality
```

## Setup

1. Make sure the backend server is running on `http://localhost:3761`
2. The frontend is served by the backend server as static files
3. Access the application at `http://localhost:3761`

## Usage

1. Start by visiting `http://localhost:3761`
2. If you don't have an account, click "Register here" to create one
3. Fill in the registration form (First Name, Last Name, Email, Password, Role)
4. After successful registration, you'll be redirected to login
5. Login with your credentials
6. You'll be redirected to the dashboard showing "Development in Progress"

## Authentication Flow

- Tokens are stored in localStorage
- Automatic redirection based on authentication status
- Logout clears tokens and redirects to login
- Protected routes check for valid tokens

## API Integration

The frontend communicates with the backend API:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Browser Compatibility

- Modern browsers with ES6+ support
- Local storage support required
- Fetch API support required

## Development Status

This is a basic implementation for initial development. Future enhancements will include:

- Course management interface
- User profile management
- Progress tracking
- Interactive lessons
- More sophisticated UI components
