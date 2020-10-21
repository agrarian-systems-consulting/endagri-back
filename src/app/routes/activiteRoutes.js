import express from 'express';
const router = express.Router();
import activiteController from '../controllers/fiche/activiteController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

// -- CREER UNE ACTIVITE DANS UNE FICHE TECHNIQUE -- //
router.post(
  '/fiche/:id_fiche_technique/activite',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI', 'AGRONOME_REGIONAL'),
  activiteController.postActivite
);

// -- MODIFIER UNE ACTIVITE DANS UNE FICHE TECHNIQUE -- //
router.put(
  '/fiche/:id_fiche_technique/activite/:id_activite',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI', 'AGRONOME_REGIONAL'),
  activiteController.putActivite
);

// -- SUPPRIMER UNE ACTIVITE DANS UNE FICHE TECHNIQUE -- //
router.delete(
  '/fiche/:id_fiche_technique/activite/:id_activite',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI', 'AGRONOME_REGIONAL'),
  activiteController.deleteActivite
);

export default router;
