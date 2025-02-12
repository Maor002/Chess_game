const http = require('http'); // מאפשר יצירת שרת HTTP
const app = require('./app'); // טוען את האפליקציה שהוגדרה ב-app.js
const { connectDB } = require('./config/db.js'); // מחבר את מסד הנתונים
const { setupSocket } = require('./sockets/gameSocket'); // מגדיר WebSocket

// משתני סביבה
require('dotenv').config();
const PORT = process.env.PORT || 3000; // משתמש במשתנה PORT מ-.env, ואם לא קיים - ברירת מחדל ל-3000

// חיבור למסד נתונים
connectDB();

// יצירת שרת HTTP ושילוב WebSocket
const server = http.createServer(app); // יוצר שרת על בסיס Express
setupSocket(server); // מחבר WebSocket לשרת

// הפעלת השרת
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
