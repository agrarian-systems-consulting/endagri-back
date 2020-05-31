const express = require('express');
const router = express.Router();
const activiteController = require('../controllers/fiche/activiteController');

router.post('/fiche/:id/activite', activiteController.postActivite);
router.put('/fiche/:id/activite/:id_activite', activiteController.putActivite);
router.delete('/fiche/:id/activite/:id_activite', activiteController.deleteActivite);

module.exports = router;
