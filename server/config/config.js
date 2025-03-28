/** @type {Object.<string, {
 *   port: number,
 *   mongoUri: string,
 *   jwtSecret: string,
 *   corsOrigin: string
 * }>} */
const config = {
  development: {
    port: Number(process.env.PORT) || 5000,
    mongoUri: `${process.env.MONGODB_URI}`,
    jwtSecret: process.env.JWT_SECRET || '',
    corsOrigin: 'http://localhost:3000'
  },
  production: {
    port: Number(process.env.PORT) || 80,
    mongoUri: `${process.env.MONGODB_URI}`,
    jwtSecret: process.env.JWT_SECRET || '',
    corsOrigin: process.env.CORS_ORIGIN || ''
  }
};

/** @type {typeof config.development} */
const selectedConfig = config[process.env.NODE_ENV || 'development'];

export default selectedConfig;