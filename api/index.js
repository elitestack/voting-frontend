import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
// import Admin from '../models/Admin.js';


import Admin from './models/Admin.js';
import Voter from './models/Voter.js';


import authRoutes from './routes/auth.js';
import votersRoutes from './routes/voters.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// ✅ Configure CORS — whitelist your allowed domains
const allowedOrigins = [
  'https://cbthost.com',         // main site
  'https://www.cbthost.com',     // www version
  'http://localhost:3000',       // local development
  'https://cbthost.vercel.app'   // vercel deployment
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/voters', votersRoutes);
app.use('/api/admin', adminRoutes);

// ✅ MongoDB Connection (handled once per execution)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected successfully');
    await ensureAdminExists();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
}

async function ensureAdminExists() {
  const username = 'admin12345';
  const email = 'admin@example13.com';
  const password = 'admin12345';

  const existing = await Admin.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    console.log('ℹ️ Admin already exists');
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = new Admin({ username, email, password: hashed });
  await admin.save();

  console.log('✅ Default admin created');
  console.log(`➡ Username: ${username}`);
  console.log(`➡ Email: ${email}`);
  console.log(`➡ Password: ${password}`);
}

// ✅ Vercel Handler
app.get('/', (req, res) => {
  res.send('CBTHost API is running ✅');
});

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
