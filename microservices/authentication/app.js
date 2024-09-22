// Express server
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const verifyToken = require('./authMiddleware');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Login route (simulated)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simulate user authentication (in future: AWS Cognito will handle this)
  if (username === 'user' && password === 'password') {
    const token = jwt.sign({ username: username }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.send({ token });
  } else {
    res.status(400).send('Invalid credentials');
  }
});

// Protected route
app.get('/profile', verifyToken, (req, res) => {
  res.send(`Hello, ${req.user.username}. This is your profile page.`);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth microservice running on port ${PORT}`);
});
