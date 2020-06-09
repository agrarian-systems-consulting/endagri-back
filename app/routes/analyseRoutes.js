const express = require('express');
const router = express.Router();
const analyseController = require('../controllers/analyse/analyseTresorieController');
const ficheTechniqueLibreController = require('../controllers/analyse/ficheTechniqueLibreController');

router.get('/analyses', analyseController.getAnalyses);
router.post('/analyse/:id_analyse/fiche-technique-libre', ficheTechniqueLibreController.postFicheTechniqueLibre);

module.exports = router;
