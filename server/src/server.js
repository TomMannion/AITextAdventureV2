import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import prisma from './models/index.js';

// Make sure Prisma is connected and database is reachable
const connectDatabase = async () => {
  try {
    // Execute a simple query to test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

// Get port from config or default to 3000
const PORT = config.server.port || 3000;

// Start the server
const startServer = async () => {
  try {
    // Make sure database is connected before starting server
    const isConnected = await connectDatabase();
    
    if (!isConnected) {
      logger.error('Cannot start server. Database connection failed');
      process.exit(1);
    }
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${config.server.env} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api`);
      logger.info(`Health check at http://localhost:${PORT}/health`);
    });
    
    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      
      // Close server
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Disconnect from database
        await prisma.$disconnect();
        logger.info('Database connection closed');
        
        // Exit
        process.exit(0);
      });
      
      // Force exit after timeout
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    // Handle various shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Start the server
const server = await startServer();

export default server;