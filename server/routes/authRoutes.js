const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');

router.post('/firebase', authController.firebaseLogin);
router.post('/signIn', authController.registerUser);
router.post('/logIn', authController.logIn);

module.exports= router;