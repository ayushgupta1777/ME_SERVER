const express = require('express');
const router = express.Router();  // Create an express router

const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwtSecret = 'anything';
const { UserModel } = require("../models/User")

// Set up CORS middleware
router.use(cors());

// Define a middleware function to authenticate users
const authenticateUser = (req, res, next) => {
  const token = req.header('x-auth-token');
  console.log('Received token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    console.log('Decoded user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Define routes using the router
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new UserModel({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });

    if (user && bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error in login endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/user', authenticateUser, (req, res) => {
  try {
    console.log('Decoded user%:', req.user);
     const { userId, username, role} = req.user;
     res.json({ userId, username, role});
   } catch (error) {
     console.error('Error in /api/user endpoint:', error);
     res.status(500).json({ error: 'Internal Server Error' });
   }
});

module.exports = router;

