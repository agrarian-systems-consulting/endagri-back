import express from 'express';
const router = express.Router();
import userManagementController from '../controllers/utilisateurs/userManagementController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

// -- AJOUTER UN UTILISATEUR D'ENDAGRI -- //
router.get(
  '/utilisateurs',
  authenticate,
  permit('SUPER_ADMIN'),
  userManagementController.getUtilisateurs
);
router.post(
  '/utilisateur/create',
  authenticate,
  permit('SUPER_ADMIN'),
  userManagementController.postUtilisateur
);
router.delete(
  '/utilisateur/:matricule',
  authenticate,
  permit('SUPER_ADMIN'),
  userManagementController.deleteUser
);

export default router;
