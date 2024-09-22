const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Middleware to verify JWT token (will be replaced by API Gateway later)
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send('Access Denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).send('Invalid token');
  }
}

module.exports = verifyToken;
