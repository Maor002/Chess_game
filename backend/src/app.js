const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const logger = require("./logger/logger");

const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const loggerRoutes = require('./routes/loggerRoutes');

const app = express();

app.use(cors({ origin: '*' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use(express.static(path.join(__dirname, '../../frontend')));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Chess server is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/logger', loggerRoutes);

// דף הבית
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Board page
app.get('/board', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/html/pages/Board.html'));
});

// 404
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Error stack:', err.stack);
    
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