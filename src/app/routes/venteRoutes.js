import express from 'express';
const router = express.Router();
import venteController from '../controllers/fiche/venteController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

router.post(
  '/fiche/:id/vente',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  venteController.postVente
);
router.put(
  '/fiche/:id/vente/:id_vente',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  venteController.putVente
);
router.delete(
  '/fiche/:id/vente/:id_vente',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  venteController.deleteVente
);

export default router;
