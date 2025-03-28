import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Extract database name from MongoDB URI
 * @param {string} uri - MongoDB connection string
 * @returns {string} Database name
 */
const getDatabaseName = (uri) => {
  try {
    return uri.split('/').pop()?.split('?')[0] || 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Test MongoDB connection
 */
const testConnection = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected Successfully!');
    console.log('✅ Database Name:', getDatabaseName(uri));
    
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
};

testConnection();