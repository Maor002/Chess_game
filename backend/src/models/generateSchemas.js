const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const behaviors = require('./behaviors');

const schemasDir = path.join(__dirname, '../schemas');
const models = {};

// ממפה סוגי JSON ל־mongoose
const mapJsonTypeToMongoose = (jsonType) => {
  const typeMap = {
    'String': mongoose.Schema.Types.String,
    'Number': mongoose.Schema.Types.Number,
    'Boolean': mongoose.Schema.Types.Boolean,
    'Date': mongoose.Schema.Types.Date,
    'ObjectId': mongoose.Schema.Types.ObjectId,
    'Mixed': mongoose.Schema.Types.Mixed,
    'Map': mongoose.Schema.Types.Map,
    'Buffer': mongoose.Schema.Types.Buffer,
    'Decimal128': mongoose.Schema.Types.Decimal128
  };
  return typeMap[jsonType] || String;
};

// המרה ל־Mongoose Schema
const convertToMongooseSchema = (jsonSchema) => {
  const result = {};

  for (const [key, value] of Object.entries(jsonSchema)) {
    if (value.type) {
      if (value.type === 'Array' && value.items) {
        result[key] = [{
          type: mapJsonTypeToMongoose(value.items.type),
          ...value.items
        }];
      } else if (value.type === 'Object' && value.properties) {
        result[key] = convertToMongooseSchema(value.properties);
      } else {
        result[key] = {
          type: mapJsonTypeToMongoose(value.type),
          ...value
        };
      }

      if (value.ref) {
        result[key].ref = value.ref;
      }
    } else if (typeof value === 'object') {
      result[key] = convertToMongooseSchema(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

// טוען שדות מתוך קבצים לפי שמות ההתנהגויות
const loadFieldsFromFiles = async (names) => {
  const combinedFields = {};

  for (const name of names) {
    const filePath = path.join(schemasDir, `${name}.json`);

    try {
      const data = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(data);

      // כל הקובץ נחשב לשדות שנוספים
      Object.assign(combinedFields, json);
    } catch (err) {
      console.warn(`⚠️ useFieldsFrom "${name}" not found at ${filePath}`);
    }
  }

  return combinedFields;
};

// בונה סכמת Mongoose
const buildSchema = async (filePath, modelName) => {
  try {
    const fileData = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(fileData);

    const {
      behaviors: schemaBehaviors = [],
      useFieldsFrom: externalFields = [],
      ...schemaFields
    } = parsed;

    // טוען שדות מקבצים חיצוניים
    const externalSchemaFields = await loadFieldsFromFiles(externalFields);
    Object.assign(schemaFields, externalSchemaFields);

    const mongooseSchema = new mongoose.Schema(
      convertToMongooseSchema(schemaFields),
      { timestamps: false }
    );

    // מוסיף hooks או methods
    for (const behavior of schemaBehaviors) {
      const func = behaviors[behavior];
      if (typeof func === 'function') {
        if (behavior.startsWith('pre')) {
          mongooseSchema.pre(behavior.slice(3).toLowerCase(), func);
        } else if (behavior.startsWith('post')) {
          mongooseSchema.post(behavior.slice(4).toLowerCase(), func);
        } else {
          mongooseSchema.methods[behavior] = func;
        }
      } else {
        console.warn(`⚠️ Behavior "${behavior}" not found in behaviors.js`);
      }
    }

    return mongooseSchema;

  } catch (err) {
    console.error(`❌ Error building schema "${modelName}":`, err);
    return null;
  }
};

// טוען את כל המודלים
const loadAllModels = async () => {
  try {
    const files = await fs.readdir(schemasDir);

    for (const file of files) {
      if (file.endsWith('.json') && !['behaviorFields.json'].includes(file)) {
        const modelName = path.basename(file, '.json');
        const filePath = path.join(schemasDir, file);

        const schema = await buildSchema(filePath, modelName);
        if (schema) {
          models[modelName] = mongoose.model(modelName, schema);
          console.log(`✅ Loaded model: ${modelName}`);
        }
      }
    }

    console.log("📦 Models loaded:", Object.keys(models));
  } catch (err) {
    console.error("❌ Error loading models:", err);
  }
};

loadAllModels().then(() => {
  module.exports = models;
});
