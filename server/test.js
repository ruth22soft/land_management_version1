import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from './config/config.js';

// Type definitions
/** @type {express.Express} */
const app = express();

/**
 * @typedef {Object} ServerResponse
 * @property {string} message
 * @property {string} environment
 * @property {number} port
 */

/**
 * @typedef {Object} TestResults
 * @property {boolean} envTest
 * @property {boolean} dbTest
 * @property {boolean} serverTest
 */

// Load environment variables
dotenv.config();

/**
 * Tests MongoDB connection
 * @returns {Promise<boolean>}
 * @throws {Error}
 */
async function testMongoDB() {
  try {
    await mongoose.connect(/** @type {string} */ (config.mongoUri));
    console.log('✅ MongoDB Connection: SUCCESS');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection: FAILED', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Tests if all required environment variables are present
 * @returns {boolean}
 */
function testEnvironmentVariables() {
  /** @type {string[]} */
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  /** @type {string[]} */
  const missing = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length === 0) {
    console.log('✅ Environment Variables: All present');
    return true;
  } else {
    console.error('❌ Environment Variables: Missing:', missing.join(', '));
    return false;
  }
}

/**
 * Runs all server tests
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function runTests() {
  console.log('🚀 Starting Server Tests...\n');

  // Test 1: Environment Variables
  console.log('1. Testing Environment Variables...');
  const envTest = testEnvironmentVariables();
  console.log('');

  // Test 2: MongoDB Connection
  console.log('2. Testing MongoDB Connection...');
  const dbTest = await testMongoDB();
  console.log('');

  // Test 3: Server Start
  console.log('3. Testing Server Start...');
  
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(/** @type {number} */ (config.port), () => {
        console.log(`✅ Server: Running on port ${config.port}`);
        server.close(() => {
          console.log('✅ Server: Successfully closed\n');
          
          // Final Results
          console.log('📋 Test Results Summary:');
          console.log('------------------------');
          console.log(`Environment Variables: ${envTest ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`MongoDB Connection: ${dbTest ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`Server Start: ✅ PASS\n`);

          if (envTest && dbTest) {
            console.log('🎉 All tests passed! Your server is configured correctly.');
          } else {
            console.log('⚠️  Some tests failed. Please check the errors above.');
          }

          resolve();
          process.exit(dbTest && envTest ? 0 : 1);
        });
      });
    } catch (error) {
      console.error('❌ Server: Failed to start', error instanceof Error ? error.message : 'Unknown error');
      reject(error);
      process.exit(1);
    }
  });
}

// Add test route with type definitions
/** @type {express.RequestHandler} */
const testHandler = (req, res) => {
  /** @type {ServerResponse} */
  const response = {
    message: 'Server is working!',
    environment: /** @type {string} */ (process.env.NODE_ENV) || 'development',
    port: /** @type {number} */ (config.port)
  };
  res.json(response);
};

app.get('/test', testHandler);

// Run the tests with proper error handling
runTests().catch((error) => {
  console.error('Test failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
}); 