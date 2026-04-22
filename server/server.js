import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Aluminaye API is running...');
});

// Socket.io for chat and video signalling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Chat message event
  socket.on('send_message', (data) => {
    // Expected data: { senderId, receiverId, text, room }
    // Broadcast to the room (which is typically just the chat room name, e.g., group or individual)
    socket.broadcast.emit('receive_message', data);
  });

  // WebRTC Signaling events
  socket.on('join_call', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user_joined_call', socket.id);
  });

  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice_candidate', (data) => {
    socket.to(data.roomId).emit('ice_candidate', data);
  });

  // Call Lifecycle Events
  socket.on('incoming_call', (data) => {
    socket.broadcast.emit('incoming_call', data);
  });

  socket.on('call_accepted', (roomId) => {
    socket.to(roomId).emit('call_accepted');
  });

  socket.on('call_declined', (data) => {
    socket.broadcast.emit('call_declined', data);
  });

  socket.on('end_call', (roomId) => {
    socket.to(roomId).emit('end_call');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
