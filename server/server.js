import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Routes
import userRoutes from './routes/userRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import callRecordRoutes from './routes/callRecordRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [];

    // Allow requests with no origin (like Postman or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
}));

app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/call-records', callRecordRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
