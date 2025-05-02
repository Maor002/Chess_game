const express = require('express'); // טוען את מודול Express( מסגרת לפיתוח אפליקציות ווב ב-JavaScript)
const cors = require('cors'); // מאפשר CORS (שיתוף משאבים בין מקורות שונים)
const morgan = require('morgan'); // לוגים של בקשות HTTP
const app = express();

app.use(express.json());// מאפשר לשרת להבין JSON בבקשות

// רישום מסלולים (Routes)
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomroutes');

app.use(morgan('dev')); // לוגים של בקשות HTTP

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/room', roomRoutes);

// מטפל בשגיאות
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});
// מטפל בשגיאות  404  אם לא נמצא מסלול מתאים לבקשה, מחזיר שגיאת 404
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
   res.status(error.status || 500);
   res.json({
    error:{
        Message: error.message
    }
   })
});

module.exports = app;

