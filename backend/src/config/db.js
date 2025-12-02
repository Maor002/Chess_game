const mongoose = require('mongoose');
const logger = require('../logger/logger');

// פונקציה לחיבור למסד הנתונים
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1); // יציאה מהתהליך במקרה של כשל
  }
};

module.exports = { connectDB };
