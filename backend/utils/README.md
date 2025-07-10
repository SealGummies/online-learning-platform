# Utils

Development and deployment utility tools.

## Files

- `test-atlas.js` - MongoDB Atlas connection tester
- `test-connection.js` - Local database connection tester
- `test-server.js` - Express server functionality tester
- `validate-env.js` - Environment variables validator
- `configure-db.js` - Database configuration wizard

## Usage

```bash
# Test database connections
npm run test-db        # Local MongoDB
npm run test-atlas     # MongoDB Atlas

# Test server setup
npm run test           # Express server

# Validate configuration
npm run validate-env   # Check environment variables
npm run config-db      # Configure database settings
```

## Purpose

These tools help with:

- **Setup validation**: Ensure proper configuration before deployment
- **Connection testing**: Verify database connectivity
- **Environment checking**: Validate all required settings
- **Development workflow**: Quick testing and debugging
