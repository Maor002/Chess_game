const mongoose = require('C');

// פונקציה לחיבור למסד הנתונים
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // יציאה מהתהליך במקרה של כשל
  }
};

module.exports = { connectDB };
