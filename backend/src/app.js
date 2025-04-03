const express = require('express');
const app = express();

app.use(express.json());

// רישום מסלולים (Routes)
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomroutes');

app.use('/api/game', gameRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

module.exports = app;

