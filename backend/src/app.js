const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const logger = require("./logger/logger");

// רישום מסלולים (Routes)
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const loggerRoutes = require('./routes/loggerRoutes');

// הגדרת middleware לאימות
//const authMiddleware = require('./middleware/auth');

const app = express();

// הגדרת CORS
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3001' || 'http://localhost:3000'||'http://localhost:5173/',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

app.use(cors({
    origin: '*'
}));

// Middleware בסיסי
app.use(express.json({ limit: '10mb' })); // מאפשר לשרת להבין JSON בבקשות
app.use(express.urlencoded({ extended: true })); // מאפשר parsing של URL-encoded data
app.use(morgan('dev')); // לוגים של בקשות HTTP

// הגשת קבצים סטטיים מה-frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// הגדרת headers נוספים
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

// מסלול בסיסי לבדיקת בריאות השרת
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Chess server is running',
        timestamp: new Date().toISOString()
    });
});

// רישום מסלולי API
app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/logger', loggerRoutes);

// מסלול לקבלת דף הבית
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/Board.html'));
});

// מטפל בשגיאות 404 - כשלא נמצא מסלול מתאים
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// מטפל בשגיאות כללי
app.use((err, req, res, next) => {
    logger.error('Error stack:', err.stack);
    
    // אם השגיאה כבר נשלחה לקליינט, העבר ל-Express
    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(status).json({
        error: {
            message: message,
            status: status,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

module.exports = app;