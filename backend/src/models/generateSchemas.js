const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const schemasPath = path.join(__dirname, '../schemas'); // תיקיית הסכמות
const models = {}; // אובייקט שיכיל את המודלים

// פונקציה להמרת JSON לסכמה של Mongoose
const loadSchema = (schemaJson) => {
    const schemaObject = JSON.parse(fs.readFileSync(schemaJson, 'utf8')); // קריאת הקובץ

    // לא נדרשים לשדות createdAt ו-updatedAt כי הם מנוהלים אוטומטית על ידי Mongoose
    return new mongoose.Schema(schemaObject, { timestamps: true }); // יצירת סכמת Mongoose
};

// קריאת כל קובצי ה-JSON ויצירת המודלים
fs.readdirSync(schemasPath).forEach(file => {
    if (file.endsWith('.json')) {
        const modelName = file.replace('.json', ''); // קבלת שם המודל
        const schemaPath = path.join(schemasPath, file);
        const schema = loadSchema(schemaPath); // טעינת הסכמה
        models[modelName] = mongoose.model(modelName, schema); // יצירת המודל
    }
});

console.log("✅ Loaded models:", Object.keys(models)); // הדפסת כל המודלים שטעונים בהצלחה
module.exports = models;
