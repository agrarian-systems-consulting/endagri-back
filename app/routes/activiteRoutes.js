const express = require('express');
const router = express.Router();
const ficheController = require('../controllers/fiche/activiteController');

router.post('/fiche/:id/activite', ficheController.postActivite);
router.put('/fiche/:id/activite/:id_activite', ficheController.putActivite);
router.delete('/fiche/:id/activite/:id_activite', ficheController.deleteActivite);

module.exports = router;
