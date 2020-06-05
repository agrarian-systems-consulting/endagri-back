const express = require('express');
const router = express.Router();
const fluxBrutsController = require('../controllers/fluxtemp/fluxBrutsController');
const fluxMoisReelsController = require('../controllers/fluxtemp/fluxMoisReelsController');
const fluxMoisReelsMoisController = require('../controllers/fluxtemp/fluxMoisReelsMoisController');
const fluxMoisReelsMoisCatController = require('../controllers/fluxtemp/fluxMoisReelsMoisCatController');

router.get('/fiche/:id/fluxbruts', fluxBrutsController.getFluxBrutsById);
router.get('/fiche/:id/flux_mois_reels', fluxMoisReelsController.getFluxMoisReelsById);
router.get('/ventefiche/:id', fluxMoisReelsController.getVenteByIdFiche);
router.get('/vente/:id', fluxMoisReelsController.getVenteById);
router.get('/fiche/:id/flux_mois_reels_mois', fluxMoisReelsMoisController.getFluxMoisReelsByIdByMois);
router.get('/fiche/:id/flux_mois_reels_mois_categorie', fluxMoisReelsMoisCatController.getFluxMoisReelsByIdByMois);

module.exports = router;
