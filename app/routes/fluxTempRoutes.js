import express from 'express';
const router = express.Router();
import fluxBrutsController from '../controllers/fluxtemp/fluxBrutsController';
import fluxMoisReelsController  from '../controllers/fluxtemp/fluxMoisReelsController';
import fluxMoisReelsMoisController from '../controllers/fluxtemp/fluxMoisReelsMoisController';
import fluxMoisReelsMoisCatController from '../controllers/fluxtemp/fluxMoisReelsMoisCatController';

router.get('/fiche/:id/fluxbruts', fluxBrutsController.getFluxBrutsById);
router.get('/fiche/:id/flux_mois_reels', fluxMoisReelsController.getFluxMoisReelsById);
router.get('/ventefiche/:id', fluxMoisReelsController.getVenteByIdFiche);
router.get('/vente/:id', fluxMoisReelsController.getVenteById);
router.get('/fiche/:id/flux_mois_reels_mois', fluxMoisReelsMoisController.getFluxMoisReelsByIdByMois);
router.get('/fiche/:id/flux_mois_reels_mois_categorie', fluxMoisReelsMoisCatController.getFluxMoisReelsByIdByMois);

export default router;
