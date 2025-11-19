const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const verifyUser = require('../middleware/jwtverify');

router.post('/firebase', authController.firebaseLogin);
router.post('/signIn', authController.registerUser);
router.post('/logIn', authController.logIn);
router.get('/getData',verifyUser, authController.getUserData);

module.exports= router;