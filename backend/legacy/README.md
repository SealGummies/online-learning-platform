# Legacy Files

This directory contains the original implementation files before the MVC architecture refactor.

## Structure

```
legacy/
├── routes/           # Original route implementations
│   ├── courses.js    # Legacy course routes with embedded business logic
│   └── enrollments.js # Legacy enrollment routes with embedded business logic
├── utils/            # Original utility implementations
│   └── transactions.js # Original transaction manager utility
└── scripts/          # Original test scripts
    └── testTransactions.js # Original transaction testing script
```

## Purpose

These files are preserved for:

1. **Reference**: Compare old vs new implementation approaches
2. **Fallback**: Emergency rollback if needed during transition period
3. **Documentation**: Understanding the evolution of the codebase
4. **Learning**: Demonstrating the benefits of MVC architecture

## Key Differences

### Legacy Approach

- **Monolithic routes**: Business logic mixed with HTTP handling
- **Embedded transactions**: Transaction management scattered across routes
- **Limited testability**: Difficult to unit test business logic
- **Code duplication**: Similar logic repeated across different endpoints

### New MVC Approach

- **Separation of concerns**: Clear layers with specific responsibilities
- **Centralized services**: Business logic consolidated in service layer
- **Enhanced testability**: Services can be tested independently
- **Code reusability**: Business logic can be reused across different contexts

## Migration Status

✅ **Completed**:

- Course management endpoints
- Enrollment and progress tracking
- Transaction management
- Testing infrastructure

🔄 **In Progress**:

- Additional service implementations
- Extended test coverage
- Performance optimizations

## Usage Notes

⚠️ **These files are no longer actively used in the application**

The current application uses the new MVC architecture located in:

- `routes/` - New route definitions
- `controllers/` - HTTP request handling
- `services/` - Business logic and transaction management
- `tests/` - Modern Jest-based testing

## Removal Timeline

These legacy files will be retained for:

- **Phase 1** (Current): Reference and comparison during development
- **Phase 2** (Future): Archive after stable production deployment
- **Phase 3** (Long-term): Consider removal after 6+ months of stable operation
