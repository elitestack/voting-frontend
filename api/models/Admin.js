// models/Admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true, // ✅ prevents duplicate key error for null/undefined
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin'] // ✅ helps enforce allowed roles
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ✅ Compare passwords
adminSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// ✅ Prevent duplicate email index on null
adminSchema.index({ email: 1 }, { unique: true, sparse: true });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
