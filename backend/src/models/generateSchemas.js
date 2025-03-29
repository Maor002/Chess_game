const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const behaviors = require('./behaviors'); // טעינת הפונקציות

const schemasPath = path.join(__dirname, '../schemas'); // תיקיית הסכמות
const models = {}; // אובייקט שיכיל את המודלים

// פונקציה להמרת JSON לסכמה של Mongoose
const loadSchema = (schemaJson, schemaName) => {
    console.log(`🔄 Loading schema for: ${schemaName}`);

    const schemaObject = JSON.parse(fs.readFileSync(schemaJson, 'utf8')); // קריאת הקובץ JSON
    if (!schemaObject || typeof schemaObject !== 'object') {
        console.error(`❌ Invalid schema format for: ${schemaName}`);
        return null;
    }

    // הסרת behaviors מהאובייקט כדי שלא יתווספו כשדות במסד הנתונים
    const { behaviors: schemaBehaviors, ...cleanSchemaObject } = schemaObject;

    const mongooseSchema = new mongoose.Schema(cleanSchemaObject, { timestamps: true }); // יצירת סכמת Mongoose

    // טיפול בהתנהגויות
    if (schemaBehaviors && Array.isArray(schemaBehaviors)) {
        console.log(`🔹 Applying behaviors for ${schemaName}:`, schemaBehaviors);

        schemaBehaviors.forEach((behaviorName) => {
            const behaviorFunction = behaviors[behaviorName]; // שליפת הפונקציה מ-behaviors.js

            if (typeof behaviorFunction === 'function') {
                // אם זה pre-hook (למשל 'preSave', 'preUpdate'), נוסיף כ-pre hook
                if (behaviorName.startsWith('pre')) {
                    const hookType = behaviorName.replace('pre', '').toLowerCase();
                    console.log(`✅ Added pre-hook: ${behaviorName} -> pre('${hookType}')`);
                    mongooseSchema.pre(hookType, behaviorFunction);
                } 
                // אם זו פונקציה רגילה, נוסיף אותה כ-method
                else {
                    console.log(`✅ Added method: ${behaviorName}`);
                    mongooseSchema.methods[behaviorName] = behaviorFunction;
                }
            } else {
                console.warn(`⚠️ Behavior "${behaviorName}" not found in behaviors.js`);
            }
        });
    }

    return mongooseSchema; // מחזירים את סכמת Mongoose
};

// קריאת כל קובצי ה-JSON ויצירת המודלים
fs.readdirSync(schemasPath).forEach(file => {
    if (file.endsWith('.json')) {
        const modelName = file.replace('.json', ''); // קבלת שם המודל
        const schemaPath = path.join(schemasPath, file);
        const schema = loadSchema(schemaPath, modelName); // טעינת הסכמה והחלת ההתנהגויות

        if (schema) {
            models[modelName] = mongoose.model(modelName, schema); // יצירת המודל
            console.log(`✅ Model loaded: ${modelName}`);
        } else {
            console.error(`❌ Failed to load model: ${modelName}`);
        }
    }
});

console.log("✅ Loaded models:", Object.keys(models)); // הדפסת כל המודלים שטעונים בהצלחה
module.exports = models;
