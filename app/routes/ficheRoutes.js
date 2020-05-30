const express = require('express');
const router = express.Router();
const ficheController = require('../controllers/fiche/ficheTechniqueController');

router.get('/fiches', ficheController.getFiches);
router.post('/fiche', ficheController.postFiche);
router.get('/fiche/:id', ficheController.getFicheById);
router.put('/fiche/:id', ficheController.putFicheById);
router.delete('/fiche/:id', ficheController.deleteFicheById);
router.get(
  '/fiche/:id/flux_mensuels',
  ficheController.getFicheByIdFluxMensuels
);
router.get(
  '/fiche/:id/flux_categorie',
  ficheController.getFicheByIdFluxCategorie
);

module.exports = router;
