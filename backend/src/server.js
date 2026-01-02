// טעינת משתני סביבה
require('dotenv').config();
console.log('LOG_LEVEL:', process.env.LOG_LEVEL);
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { setupSocket } = require('./sockets/gameSocket');
const { init: initModels } = require('./schema-generators/generateSchemas');
const logger = require("./logger/logger");



// הגדרת פורט
const PORT = process.env.PORT || 3001; // שינוי לפורט 3001 כדי לא להתנגש עם Frontend

// פונקציה אסינכרונית להפעלת השרת
async function startServer() {
    try {
        // חיבור למסד נתונים
        logger.info('Connecting to database...');
        await connectDB();
        logger.info('Database connected successfully');

        // טעינת כל המודלים
        logger.info('Loading models...');
        await initModels();
        logger.info('All models loaded successfully');

        // יצירת שרת HTTP
        const server = http.createServer(app);

        // הגדרת WebSocket
        logger.info('Setting up WebSocket...');
        setupSocket(server);
        logger.info('WebSocket configured successfully');

        // הפעלת השרת
        server.listen(PORT, () => {
            logger.info(`🚀 Chess Server is running on http://localhost:${PORT}`);
            logger.info(`📁 Frontend files served from: /frontend`);
            logger.info(`🎮 Game API available at: http://localhost:${PORT}/api/game`);
            logger.info(`👤 User API available at: http://localhost:${PORT}/api/user`);
            logger.info(`🏠 Room API available at: http://localhost:${PORT}/api/room`);
            logger.info(`❤️  Health check: http://localhost:${PORT}/health`);
            logger.info(`🔌 WebSocket ready for connections`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // טיפול בסגירה נקייה של השרת
        process.on('SIGTERM', () => {
            logger.info('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT signal received: closing HTTP server');
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        });

        // טיפול בשגיאות לא צפויות
        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception:', err);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// הפעלת השרת
startServer();
