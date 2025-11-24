const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { setupSocket } = require('./sockets/gameSocket');
const { init: initModels } = require('./models/generateSchemas');

// טעינת משתני סביבה
require('dotenv').config();

// הגדרת פורט
const PORT = process.env.PORT || 3001; // שינוי לפורט 3001 כדי לא להתנגש עם Frontend

// פונקציה אסינכרונית להפעלת השרת
async function startServer() {
    try {
        // חיבור למסד נתונים
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected successfully');

        // טעינת כל המודלים
        console.log('Loading models...');
        await initModels();
        console.log('All models loaded successfully');

        // יצירת שרת HTTP
        const server = http.createServer(app);

        // הגדרת WebSocket
        console.log('Setting up WebSocket...');
        setupSocket(server);
        console.log('WebSocket configured successfully');

        // הפעלת השרת
        server.listen(PORT, () => {
            console.log(`🚀 Chess Server is running on http://localhost:${PORT}`);
            console.log(`📁 Frontend files served from: /frontend`);
            console.log(`🎮 Game API available at: http://localhost:${PORT}/api/game`);
            console.log(`👤 User API available at: http://localhost:${PORT}/api/user`);
            console.log(`🏠 Room API available at: http://localhost:${PORT}/api/room`);
            console.log(`❤️  Health check: http://localhost:${PORT}/health`);
            console.log(`🔌 WebSocket ready for connections`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // טיפול בסגירה נקייה של השרת
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0);
            });
        });

        // טיפול בשגיאות לא צפויות
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// הפעלת השרת
startServer();
