import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@alumni.com' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit();
    }
    
    // Hash standard password explicitly to bypass user model controller hooks if necessary
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    await User.create({
      name: 'System Admin',
      email: 'admin@alumni.com',
      password: hashedPassword,
      role: 'admin',
      bio: 'System Administrator',
      city: 'Admin HQ'
    });
    console.log('Admin seeded successfully! Check email: admin@alumni.com / password: Admin@123');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
seedAdmin();
