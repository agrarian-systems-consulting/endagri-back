const express = require('express');
const router = express.Router();
const analyseController = require('../controllers/analyse/analyseTresorieController');

router.get('/analyses', analyseController.getAnalyses);
router.post('/fiche-technique-libre/nouvelle', analyseController.postFicheTechniqueLibre);

module.exports = router;
