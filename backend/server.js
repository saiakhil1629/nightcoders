import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Route Imports
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import taskRoutes from './routes/tasks.js';
import leaderboardRoutes from './routes/leaderboard.js';
import assignmentRoutes from './routes/assignments.js';
import aiRoutes from './routes/ai.js';

// Load Env
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io integration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Socket.io Event Handling
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their notification channel`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Expose Socket.io instance to request pipeline
app.use((req, res, next) => {
  req.io = io;
  next();
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ai', aiRoutes);

// Base route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Code2Career Backend online and ready (Supabase).' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`🔥 Server listening on port ${PORT}`);
  });
};

startServer();
