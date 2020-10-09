import express from 'express';
const router = express.Router();
import marcheController from '../controllers/fiche/marcheController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

router.get('/marches',   authenticate,
permit(
  'SUPER_ADMIN',
  'ADMINISTRATEUR_ENDAGRI',
  'AGRONOME_REGIONAL',
  'SUPERVISEUR_AGENCE',
  'GESTIONNAIRE_DE_PORTEFEUILLE'
),marcheController.getMarches);
router.post('/marche',   authenticate,
permit(
  'SUPER_ADMIN',
  'ADMINISTRATEUR_ENDAGRI',
  'AGRONOME_REGIONAL',
  'SUPERVISEUR_AGENCE',
  'GESTIONNAIRE_DE_PORTEFEUILLE'
),marcheController.postMarche);
router.get('/marche/:id',   authenticate,
permit(
  'SUPER_ADMIN',
  'ADMINISTRATEUR_ENDAGRI',
  'AGRONOME_REGIONAL',
  'SUPERVISEUR_AGENCE',
  'GESTIONNAIRE_DE_PORTEFEUILLE'
),marcheController.getMarcheById);
router.put('/marche/:id',   authenticate,
permit(
  'SUPER_ADMIN',
  'ADMINISTRATEUR_ENDAGRI',
  'AGRONOME_REGIONAL',
  'SUPERVISEUR_AGENCE',
  'GESTIONNAIRE_DE_PORTEFEUILLE'
),marcheController.putMarcheById);
router.delete('/marche/:id',   authenticate,
permit(
  'SUPER_ADMIN',
  'ADMINISTRATEUR_ENDAGRI',
  'AGRONOME_REGIONAL',
  'SUPERVISEUR_AGENCE',
  'GESTIONNAIRE_DE_PORTEFEUILLE'
),marcheController.deleteMarcheById);

export default router;
