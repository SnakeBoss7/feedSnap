const express = require('express');
const router = express.Router();
const {widgetConfigProvider} = require('../controllers/widgetController');

router.get('/GetWidConfig',widgetConfigProvider);

module.exports = router;