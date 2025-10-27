import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';

import authRoutes from './routes/auth.js';
import votersRoutes from './routes/voters.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/voters', votersRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-system')
  .then(() => {
    console.log('Connected to MongoDB');
    createAdmin('admin12345', 'admin@example13.com', 'admin12345');
  })
  .catch((err) => console.error('MongoDB connection error:', err));

/**
 * Function to create a new admin user safely
 * @param {string} username
 * @param {string} email
 * @param {string} password
 */
async function createAdmin(username, email, password) {
  try {
    // Check if username or email already exists
    const existing = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      console.log(`Admin with username "${username}" or email "${email}" already exists`);
      return;
    }

    const hashedPassword = password;

    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
    });

    await admin.save();
    console.log('✅ New admin created successfully!');
    console.log(`➡ Username: ${username}`);
    console.log(`➡ Email: ${email}`);
    console.log(`➡ Password: ${password}`);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
