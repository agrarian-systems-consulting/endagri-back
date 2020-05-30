const express = require('express');
const router = express.Router();
const analyseController = require('../controllers/analyse/analyseTresorieController');

router.get('/analyses', analyseController.getAnalyses);

module.exports = router;
