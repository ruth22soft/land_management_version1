/** @type {Object.<string, {
 *   port: number,
 *   mongoUri: string,
 *   jwtSecret: string,
 *   corsOrigin: string
 * }>} */
const config = {
  development: {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lrms',
    jwtSecret: process.env.JWT_SECRET || 'ec0c55f5-1747-4855-b887-d08af4d70723',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  production: {
    port: Number(process.env.PORT) || 80,
    mongoUri: process.env.MONGODB_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
    corsOrigin: process.env.CORS_ORIGIN || ''
  }
};

// Validate required configuration
const env = process.env.NODE_ENV || 'development';
const selectedConfig = config[env];

// In development, we can use the default secret, but in production we must have it set
if (env === 'production' && !selectedConfig.jwtSecret) {
  throw new Error('JWT_SECRET is required in production environment');
}

if (env === 'production' && !selectedConfig.mongoUri) {
  throw new Error('MONGODB_URI is required in production environment');
}

export default selectedConfig;