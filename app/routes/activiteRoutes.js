const express = require('express');
const router = express.Router();
const activiteController = require('../controllers/fiche/activiteController');

router.post('/fiche/:id/activite', activiteController.postActivite);
router.put(
  '/fiche/:id_fiche_technique/activite/:id_activite',
  activiteController.putActivite
);
router.delete(
  '/fiche/:id_fiche_technique/activite/:id_activite',
  activiteController.deleteActivite
);

module.exports = router;
