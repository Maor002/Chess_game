const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const behaviors = require('./behaviors');
const logger = require('../logger/logger');

const schemasDir = path.join(__dirname, '../schemas');
const models = {};
let modelsReady = false;

// ========================================
// Schema Storage Model (MongoDB)
// ========================================

let SchemaStorageModel = null;

const getSchemaStorageModel = () => {
  if (SchemaStorageModel) return SchemaStorageModel;

  const storageSchema = new mongoose.Schema({
    modelName: { type: String, required: true, unique: true },
    hash: { type: String, required: true },
    schemaDefinition: { type: mongoose.Schema.Types.Mixed, required: true },
    behaviors: [String],
    timestamps: Boolean,
    updatedAt: { type: Date, default: Date.now }
  });

  SchemaStorageModel = mongoose.model('SchemaStorage', storageSchema);
  return SchemaStorageModel;
};

// ========================================
// Hash Utilities
// ========================================

const getFileHash = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return null;
  }
};

// ========================================
// Schema Save/Load from MongoDB
// ========================================

const saveSchemaToMongo = async (modelName, hash, schemaDefinition, schemaBehaviors, timestamps) => {
  const SchemaStorage = getSchemaStorageModel();
  await SchemaStorage.findOneAndUpdate(
    { modelName },
    { 
      modelName, 
      hash, 
      schemaDefinition,
      behaviors: schemaBehaviors,
      timestamps,
      updatedAt: new Date() 
    },
    { upsert: true }
  );
  logger.info(`💾 Saved schema to MongoDB: ${modelName}`);
};

const loadSchemaFromMongo = async (modelName) => {
  try {
    const SchemaStorage = getSchemaStorageModel();
    return await SchemaStorage.findOne({ modelName });
  } catch {
    return null;
  }
};

// ========================================
// Type Mapping
// ========================================

const mapJsonTypeToMongoose = (jsonType) => {
  const typeMap = {
    'String': 'String',
    'Number': 'Number',
    'Boolean': 'Boolean',
    'Date': 'Date',
    'ObjectId': 'ObjectId',
    'Mixed': 'Mixed',
    'Map': 'Map',
    'Buffer': 'Buffer',
    'Decimal128': 'Decimal128'
  };
  return typeMap[jsonType] || 'String';
};

const resolveMongooseType = (typeName) => {
  const types = {
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
  return types[typeName] || String;
};

// ========================================
// Schema Conversion (for saving)
// ========================================

const convertToStorableSchema = (jsonSchema) => {
  const result = {};

  for (const [key, value] of Object.entries(jsonSchema)) {
    if (key === '_id') continue;

    if (value.type) {
      if (value.type === 'Array' && value.items) {
        result[key] = {
          isArray: true,
          itemType: mapJsonTypeToMongoose(value.items.type),
          ...value.items
        };
      } else if (value.type === 'Object' && value.properties) {
        result[key] = {
          isObject: true,
          properties: convertToStorableSchema(value.properties)
        };
      } else {
        result[key] = {
          type: mapJsonTypeToMongoose(value.type)
        };
        
        for (const [propKey, propValue] of Object.entries(value)) {
          if (propKey !== 'type') {
            result[key][propKey] = propKey === 'default' && propValue === 'Date.now' 
              ? 'Date.now' 
              : propValue;
          }
        }
      }

      if (value.ref) result[key].ref = value.ref;
    } else if (typeof value === 'object') {
      result[key] = convertToStorableSchema(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

// ========================================
// Schema Restoration (from MongoDB)
// ========================================

const restoreMongooseSchema = (storedSchema) => {
  const result = {};

  for (const [key, value] of Object.entries(storedSchema)) {
    if (value.isArray) {
      const { isArray, itemType, ...rest } = value;
      result[key] = [{
        type: resolveMongooseType(itemType),
        ...rest
      }];
    } else if (value.isObject) {
      result[key] = restoreMongooseSchema(value.properties);
    } else if (value.type) {
      const { type, ...rest } = value;
      result[key] = {
        type: resolveMongooseType(type),
        ...rest
      };
      
      // Handle Date.now restoration
      if (result[key].default === 'Date.now') {
        result[key].default = Date.now;
      }
    } else if (typeof value === 'object') {
      result[key] = restoreMongooseSchema(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

// ========================================
// External Fields Loading
// ========================================

const loadFieldsFromFiles = async (names) => {
  const combinedFields = {};

  for (const name of names) {
    const filePath = path.join(schemasDir, `${name}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(data);
      const fieldsToAdd = json.fields || json;
      Object.assign(combinedFields, fieldsToAdd);
      logger.info(`✅ Loaded fields from: ${name}`);
    } catch (err) {
      logger.warn(`⚠️ useFieldsFrom "${name}" not found`);
    }
  }

  return combinedFields;
};

// ========================================
// Schema Building from JSON
// ========================================

const buildSchemaFromJson = async (filePath, modelName) => {
  try {
    const fileData = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(fileData);

    const {
      behaviors: schemaBehaviors = [],
      useFieldsFrom: externalFields = [],
      fields = {},
      timestamps = false,
      ...schemaFields
    } = parsed;

    const finalSchemaFields = { ...fields };
    const externalSchemaFields = await loadFieldsFromFiles(externalFields);
    Object.assign(finalSchemaFields, externalSchemaFields, schemaFields);

    // Convert and save to MongoDB
    const storableSchema = convertToStorableSchema(finalSchemaFields);
    const currentHash = await getFileHash(filePath);
    
    await saveSchemaToMongo(modelName, currentHash, storableSchema, schemaBehaviors, timestamps);

    return { schemaDefinition: storableSchema, behaviors: schemaBehaviors, timestamps };
  } catch (err) {
    logger.error(`❌ Error building schema "${modelName}":`, err);
    return null;
  }
};

// ========================================
// Create Mongoose Model
// ========================================

const createMongooseModel = (modelName, schemaDefinition, schemaBehaviors = [], timestamps = false) => {
  const restoredSchema = restoreMongooseSchema(schemaDefinition);
  const mongooseSchema = new mongoose.Schema(restoredSchema, { timestamps });

  // Apply behaviors
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
      logger.warn(`⚠️ Behavior "${behavior}" not found`);
    }
  }

  return mongoose.model(modelName, mongooseSchema);
};

// ========================================
// Main Loading Logic
// ========================================

const loadOrUseExistingModel = async (file) => {
  const modelName = path.basename(file, '.json');
  const filePath = path.join(schemasDir, file);

  // Check if JSON file changed
  const currentHash = await getFileHash(filePath);
  logger.debug(`🔍 Checking model: ${modelName}, hash: ${currentHash}`);
  
  const stored = await loadSchemaFromMongo(modelName);
  logger.debug(`📊 Stored in MongoDB:`, stored ? `hash=${stored.hash}` : 'NOT FOUND');

  if (stored && stored.hash === currentHash) {
    // ♻️ Use schema from MongoDB
    logger.debug(`♻️  Loading from MongoDB: ${modelName}`);
    models[modelName] = createMongooseModel(
      modelName, 
      stored.schemaDefinition, 
      stored.behaviors, 
      stored.timestamps
    );
  } else {
    // 🏗️ Build from JSON and save to MongoDB
    logger.debug(`🏗️  Building from JSON: ${modelName}`);
    const schemaData = await buildSchemaFromJson(filePath, modelName);
    
    if (schemaData) {
      logger.debug(`✅ Schema built, creating model...`);
      models[modelName] = createMongooseModel(
        modelName,
        schemaData.schemaDefinition,
        schemaData.behaviors,
        schemaData.timestamps
      );
      logger.info(`💾 Model created and saved to MongoDB`);
    } else {
      logger.error(`❌ Failed to build schema for ${modelName}`);
    }
  }
};

// ========================================
// Initialization
// ========================================

const loadAllModels = async () => {
  try {
    const files = await fs.readdir(schemasDir);
    const jsonFiles = files.filter(f => 
      f.endsWith('.json') && !['behaviorFields.json'].includes(f)
    );

    for (const file of jsonFiles) {
      await loadOrUseExistingModel(file);
    }

    logger.info("📦 Models ready:", Object.keys(models));
    modelsReady = true;
    return models;
  } catch (err) {
    logger.error("❌ Error loading models:", err);
    throw err;
  }
};

// ========================================
// Exports
// ========================================

module.exports = {
  models,
  init: loadAllModels,
  isReady: () => modelsReady,
  getModel: (name) => models[name]
};