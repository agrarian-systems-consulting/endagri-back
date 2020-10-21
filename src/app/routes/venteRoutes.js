import express from 'express';
const router = express.Router();
import venteController from '../controllers/fiche/venteController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

// -- CREER UNE VENTE DANS UNE FICHE TECHNIQUE -- //
router.post(
  '/fiche/:id/vente',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  venteController.postVente
);

// -- MODIFIER UNE VENTE DANS UNE FICHE TECHNIQUE -- //
router.put(
  '/fiche/:id/vente/:id_vente',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  venteController.putVente
);

// -- SUPPRIMER UNE VENTE DANS UNE FICHE TECHNIQUE -- //
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
