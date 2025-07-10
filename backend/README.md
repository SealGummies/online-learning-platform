# Backend API

REST API for the Online Learning Platform built with Node.js, Express, and MongoDB.

## Features

- **JWT Authentication** with role-based access control
- **MongoDB integration** with local and cloud support
- **RESTful API** with full CRUD operations
- **5 collections**: Users, Courses, Enrollments, Lessons, Exams
- **3 user roles**: Student, Instructor, Admin

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
```

### 3. Choose Database Option

#### Option A: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster and get connection string
3. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/online-learning-platform?retryWrites=true&w=majority&appName=AppName
   ```
4. Test connection:
   ```bash
   npm run test-atlas
   ```

#### Option B: Local MongoDB

1. Install and start MongoDB locally
2. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/online-learning-platform
   ```
3. Test connection:
   ```bash
   npm run test-db
   ```

### 4. Initialize Database

```bash
# Populate with sample data
npm run seed
```

### 5. Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server runs at `http://localhost:3761`

## Environment Variables

Required variables in `.env`:

```env
NODE_ENV=development
PORT=3761
MONGODB_URI=your-database-connection-string
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=30d
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run seed` - Populate database with sample data
- `npm run test-db` - Test local MongoDB connection
- `npm run test-atlas` - Test MongoDB Atlas connection
- `npm run validate-env` - Validate environment configuration

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resources

- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (Instructor)
- `GET /api/enrollments` - User enrollments (Student)
- `POST /api/courses/:id/enroll` - Enroll in course (Student)

### Admin

- `GET /api/users` - Manage users (Admin)

## Project Structure

```
backend/
├── config/          # Database configuration
├── middleware/      # Authentication middleware
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── scripts/         # Database seeding
├── utils/           # Development tools
└── server.js        # Main server file
```

## Sample Users

After running `npm run seed`, you can login with:

- **Admin**: `admin@example.com` / `password123`
- **Instructor**: `john.smith@example.com` / `password123`
- **Student**: `alice.johnson@example.com` / `password123`

## Troubleshooting

### Database Connection Issues

1. **Local MongoDB**: Ensure MongoDB is running (`mongod`)
2. **MongoDB Atlas**: Check connection string and IP whitelist
3. **Validation**: Run `npm run validate-env`

### Common Problems

- **Port in use**: Change `PORT` in `.env`
- **JWT errors**: Ensure `JWT_SECRET` is set
- **Connection timeout**: Check network and credentials

For detailed configuration help, see project documentation.
