import express from 'express';
const router = express.Router();
import fluxBrutsController from '../controllers/fluxtemp/fluxBrutsController';
import fluxMoisReelsController from '../controllers/fluxtemp/fluxMoisReelsController';
import fluxMoisReelsMoisController from '../controllers/fluxtemp/fluxMoisReelsMoisController';
import fluxMoisReelsMoisCatController from '../controllers/fluxtemp/fluxMoisReelsMoisCatController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

router.get(
  '/fiche/:id/fluxbruts',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  fluxBrutsController.getFluxBrutsById
);
router.get(
  '/fiche/:id/flux_mois_reels',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  fluxMoisReelsController.getFluxMoisReelsById
);
router.get(
  '/ventefiche/:id',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  fluxMoisReelsController.getVenteByIdFiche
);
router.get(
  '/vente/:id',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  fluxMoisReelsController.getVenteById
);
router.get(
  '/fiche/:id/flux_mois_reels_mois',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  fluxMoisReelsMoisController.getFluxMoisReelsByIdByMois
);
router.get(
  '/fiche/:id/flux_mois_reels_mois_categorie',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  fluxMoisReelsMoisCatController.getFluxMoisReelsByIdByMois
);

export default router;
