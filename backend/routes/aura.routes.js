const express = require('express');
const router = express.Router();
const auraController = require('../controllers/aura.controller');

router.post('/', auraController.handleMessage);

module.exports = router;


  


