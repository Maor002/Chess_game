const express = require('express');
const models = require('../models/generateSchemas'); // טוען את כל המודלים
const userFunctions = require('../Controller/userFunc'); // טוען את הפונקציות של המשתמשים
const logger = require("../logger/logger");
const router = express.Router();

const User = models.User; // מקבל את מודל המשתמש

if (!User) {
  logger.error("❌ User model is not loaded correctly!");
}

// יצירת משתמש חדש
router.post('/register',userFunctions.register);
router.post('/login',userFunctions.login);

module.exports = router;
