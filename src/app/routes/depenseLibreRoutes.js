import express from 'express';
import depenseLibre from '../controllers/analyse/depenseLibreController';
const router = express.Router();
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

router.get(
  '/analyse/:id/depenses_libres',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  depenseLibre.getAllDepensesLibres
);
router.post(
  '/analyse/:id/depense_libre',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  depenseLibre.postDepenseLibre
);
router.get(
  '/analyse/:id/depense_libre/:id_depense_libre',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  depenseLibre.getDepenseLibreById
);
router.delete(
  '/analyse/:id/depense_libre/:id_depense_libre',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  depenseLibre.deleteDepenseLibre
);

export default router;
