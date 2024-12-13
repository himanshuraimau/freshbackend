import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Import the User model

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Controller Logic
const userController = {
  // Signup Logic
  signup: async (req, res) => {
    const { fullName, email, phoneNumber, password } = req.body;

    // Add input validation
    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate phone number (assuming 10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    try {
      // Check if user exists by email OR phone number
      const existingUser = await User.findOne({ 
        $or: [{ email }, { phoneNumber }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email or phone number already exists.' 
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create and save the new user
      const newUser = new User({ fullName, email, phoneNumber, password: hashedPassword });
      await newUser.save();

      return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error registering user.' });
    }
  },

  // Login Logic
  login: async (req, res) => {
    const { email, phoneNumber, password } = req.body;

    if (!password || !(email || phoneNumber)) {
      return res.status(400).json({ 
        message: 'Please provide password and either email or phone number.' 
      });
    }

    try {
      // Find user by either email or phone number, but in separate queries
      let user;
      if (email) {
        user = await User.findOne({ email });
      } else if (phoneNumber) {
        // Ensure phoneNumber is treated as a number if provided
        user = await User.findOne({ phoneNumber: Number(phoneNumber) });
      }

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

     
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: '1d',
      });

      return res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error logging in.' });
    }
  }
};

export default userController;

