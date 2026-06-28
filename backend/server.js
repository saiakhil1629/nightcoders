import express from 'express';
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

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ai', aiRoutes);

// Base route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Code2Career Backend online and ready (Vercel Serverless).' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server conditionally (for local dev only)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🔥 Server listening on port ${PORT}`);
  });
}

// Export the Express app for Vercel Serverless Functions
export default app;
