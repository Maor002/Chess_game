const express = require('express');
const models = require('../models/generateSchemas'); // טוען את כל המודלים
const userFunctions = require('../routesFunc/userFunc'); // טוען את הפונקציות של המשתמשים
const router = express.Router();

const User = models.User; // מקבל את מודל המשתמש

if (!User) {
  console.error("❌ User model is not loaded correctly!");
}

// יצירת משתמש חדש
router.post('/api/users/register',userFunctions.register);
router.post('/api/users/login',userFunctions.login);

module.exports = router;
