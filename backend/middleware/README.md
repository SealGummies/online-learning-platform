# Middleware

Express middleware functions.

## Files

- `auth.js` - JWT authentication middleware
  - Token validation
  - Role-based access control
  - Route protection

## Usage

```javascript
router.get("/protected", auth, (req, res) => {
  // req.user contains authenticated user info
});
```
