import express from 'express';
const router = express.Router();
import userManagementController from '../controllers/utilisateurs/userManagementController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

router.post(
  '/register',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  userManagementController.registerUser
);
router.delete(
  '/user/:matricule/delete',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  userManagementController.deleteUser
);

export default router;
