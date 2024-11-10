const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

// ... (other code)

// When signing JWT tokens
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});

// When encrypting sensitive data (in User model)
pan: {
  type: String,
  required: true,
  unique: true,
  set: (value) => CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString(),
  get: (value) => CryptoJS.AES.decrypt(value, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
},
aadhaar: {
  type: String,
  required: true,
  unique: true,
  set: (value) => CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString(),
  get: (value) => CryptoJS.AES.decrypt(value, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
},

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const {
      username,
      mobileNumber,
      email,
      pan,
      aadhaar,
      classXRollNo,
      maritalStatus,
      numberOfChildren,
      marriageCertificateNumber,
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      mobileNumber,
      email,
      pan,
      aadhaar,
      classXRollNo,
      maritalStatus,
      numberOfChildren,
      marriageCertificateNumber,
    });

    // Save user to database
    await user.save();

    // Create and send JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { identifier } = req.body;

    // Check if user exists
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobileNumber: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found. Please sign up.' });
    }

    // In a real-world scenario, you would verify the password here
    // For this example, we'll just create and send a token

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details route
router.get('/user', async (req, res) => {
  try {
    // In a real-world scenario, you would extract the user ID from the JWT token
    // For this example, we'll assume the user ID is passed as a query parameter
    const { userId } = req.query;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // The PAN and Aadhaar will be automatically decrypted due to the getter in the schema
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
