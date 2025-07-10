# Environment Variables Configuration Guide

This guide explains how to configure environment variables for the Online Learning Platform.

## Setup Instructions

1. **Copy the template file:**

   ```bash
   cp .env.example .env
   ```

2. **Update the values in `.env` with your actual configuration**

## Required Variables

### Application Configuration

- `NODE_ENV`: Application environment (development, production, test)
- `PORT`: Server port (default: 3001)

### Database Configuration

Choose **ONE** of the following options:

#### Option 1: Local MongoDB

```
MONGODB_URI=mongodb://localhost:27017/online-learning-platform
```

#### Option 2: MongoDB Atlas (Cloud)

```
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/online-learning-platform?retryWrites=true&w=majority&appName=AppName
```

**To get your MongoDB Atlas connection string:**

1. Login to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Go to your cluster dashboard
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials

### JWT Configuration

- `JWT_SECRET`: Secret key for JWT tokens (use a strong, unique key)
- `JWT_EXPIRE`: Token expiration time (e.g., 30d, 7d, 24h)

## Optional Variables

These variables are for future features and can be left commented out:

### Email Configuration

For user notifications and password reset functionality:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### File Upload Configuration

For course materials and user avatars:

```
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Redis Configuration

For caching and session management:

```
REDIS_URL=redis://localhost:6379
```

### Cloudinary Configuration

For cloud-based image storage:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### API Configuration

For rate limiting and CORS:

```
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=15
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

## Security Notes

1. **Never commit `.env` files to version control**
2. **Use strong, unique secrets for production**
3. **Keep database credentials secure**
4. **Rotate JWT secrets regularly in production**
5. **Use environment-specific configurations**

## Testing Your Configuration

After setting up your `.env` file, you can test the configuration:

```bash
# Test database connection
npm run test-db

# Test MongoDB Atlas connection
npm run test-atlas

# Start the server
npm run dev
```

## Environment Examples

### Development Environment

```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/online-learning-platform
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=30d
```

### Production Environment

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://produser:strongpassword@cluster.xxxxx.mongodb.net/online-learning-platform?retryWrites=true&w=majority
JWT_SECRET=very-strong-production-secret-key-with-random-characters
JWT_EXPIRE=7d
```

## Troubleshooting

### Common Issues

1. **Database connection failed**

   - Check your MONGODB_URI format
   - Verify credentials for MongoDB Atlas
   - Ensure MongoDB service is running (for local)

2. **JWT authentication not working**

   - Verify JWT_SECRET is set
   - Check token expiration time
   - Ensure consistent secret across restarts

3. **Port already in use**
   - Change PORT value in .env
   - Kill processes using the port: `lsof -i :3001`

### Getting Help

If you encounter issues:

1. Check the server logs for error messages
2. Verify all required variables are set
3. Test database connectivity separately
4. Refer to the main README.md for additional setup instructions
