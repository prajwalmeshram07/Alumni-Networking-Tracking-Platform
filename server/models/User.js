import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  profilePic: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  company: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: '' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
