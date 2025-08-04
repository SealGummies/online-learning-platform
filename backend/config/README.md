# Config Directory

This directory contains configuration files and modules that define application-wide settings and constants.

## Overview

The config layer provides:
- Database connection configuration
- Application settings
- Environment-specific configurations
- Shared constants and enums
- Configuration helpers

## Configuration Files

### database.js
- **Purpose**: MongoDB connection configuration
- **Functionality**:
  - Establishes connection to MongoDB (local or Atlas)
  - Handles connection errors
  - Logs connection status
  - Supports both local and cloud databases

### populateConfig.js (if exists)
- **Purpose**: Centralized population field definitions
- **Usage**: Defines which fields to populate for different contexts
- **Example**:
  ```javascript
  PopulateConfig.helpers.getUserFields('public')  // Returns basic fields
  PopulateConfig.helpers.getUserFields('detailed') // Returns all fields
  ```

### passwordConfig.js (if exists)
- **Purpose**: Password hashing configuration
- **Features**:
  - Centralized bcrypt salt rounds
  - Password hashing utilities
  - Password comparison methods

## Environment Variables

The application uses the following environment variables:

```env
# Server Configuration
NODE_ENV=development|production|test
PORT=3761

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/online-learning-platform
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d

# Password Hashing
BCRYPT_SALT_ROUNDS=10

# Future Configurations
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USERNAME=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password
# REDIS_URL=redis://localhost:6379
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Configuration Patterns

### Database Connection
```javascript
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-learning-platform';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
```

### Configuration Constants
```javascript
module.exports = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // User Roles
  USER_ROLES: {
    STUDENT: 'student',
    INSTRUCTOR: 'instructor',
    ADMIN: 'admin'
  },
  
  // Course Settings
  COURSE_CATEGORIES: [
    'Programming',
    'Data Science',
    'Web Development',
    'AI/ML',
    'Database',
    'Other'
  ],
  
  COURSE_LEVELS: ['Beginner', 'Intermediate', 'Advanced'],
  
  // Enrollment Status
  ENROLLMENT_STATUS: {
    ENROLLED: 'enrolled',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    DROPPED: 'dropped'
  },
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
};
```

## Best Practices

1. **Environment Variables**: Use .env for sensitive data
2. **Default Values**: Always provide sensible defaults
3. **Type Safety**: Validate configuration values
4. **Documentation**: Document all configuration options
5. **No Secrets in Code**: Never commit sensitive data
6. **Centralization**: Keep all config in one place

## Configuration Validation

```javascript
// validate-env.js example
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
```

## Environment-Specific Settings

```javascript
const config = {
  development: {
    db: {
      uri: 'mongodb://localhost:27017/online-learning-dev'
    },
    cors: {
      origin: '*'
    }
  },
  production: {
    db: {
      uri: process.env.MONGODB_URI
    },
    cors: {
      origin: process.env.FRONTEND_URL
    }
  },
  test: {
    db: {
      uri: 'mongodb://localhost:27017/online-learning-test'
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

## Adding New Configuration

1. **Add to .env.example**: Document new variables
2. **Provide Defaults**: In case env var is missing
3. **Validate on Startup**: Check required values exist
4. **Type Check**: Ensure values are correct type
5. **Document Usage**: Explain what the config does

## Testing Configuration

```javascript
describe('Database Configuration', () => {
  it('should connect to test database', async () => {
    process.env.NODE_ENV = 'test';
    const conn = await connectDB();
    expect(conn.connection.name).toBe('online-learning-test');
  });
  
  it('should throw error with invalid URI', async () => {
    process.env.MONGODB_URI = 'invalid-uri';
    await expect(connectDB()).rejects.toThrow();
  });
});
```