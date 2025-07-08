const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');

router.post('/firebase', authController.firebaseLogin);

module.exports= router;