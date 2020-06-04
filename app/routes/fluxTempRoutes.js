const express = require('express');
const router = express.Router();
const fluxBrutsController = require('../controllers/fluxtemp/fluxBrutsController');
const fluxMoisReelsController = require('../controllers/fluxtemp/fluxMoisReelsController');

router.get('/fiche/:id/fluxbruts', fluxBrutsController.getFluxBrutsById);
router.get('/fiche/:id/flux_mois_reels', fluxMoisReelsController.getFluxMoisReelsById);
router.get('/ventefiche/:id', fluxMoisReelsController.getVenteByIdFiche);
router.get('/vente/:id', fluxMoisReelsController.getVenteById);

module.exports = router;
