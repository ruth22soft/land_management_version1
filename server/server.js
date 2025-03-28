import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes with correct paths
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import parcelRoutes from './routes/parcel.routes.js';
import ownerRoutes from './routes/owner.routes.js';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

/** @type {express.Express} */
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/owners', ownerRoutes);

// Test route
/** @type {express.RequestHandler} */
const testHandler = (req, res) => {
  res.json({ 
    message: 'Land Registration API is running',
    time: new Date().toISOString()
  });
};

app.get('/test', testHandler);

/**
 * Connects to MongoDB and starts the server
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Check if MongoDB URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect(/** @type {string} */ (process.env.MONGODB_URI), {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Connected Successfully!');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Disconnected');
    });

    // Start server only after successful database connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err instanceof Error ? err.message : String(err));
    console.error('❌ Make sure MongoDB is running on your system');
    console.error('❌ Server will not start due to database connection failure');
    process.exit(1); // Exit the process with error code
  }
};

// Call connectDB with proper error handling
void connectDB().catch((err) => {
  console.error('Failed to connect:', err);
  process.exit(1);
});

// Error handling middleware
/** @type {express.ErrorRequestHandler} */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
};

app.use(errorHandler);