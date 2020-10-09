import express from 'express';
const router = express.Router();
import userManagementController from '../controllers/utilisateurs/userManagementController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

// -- AJOUTER UN UTILISATEUR D'ENDAGRI -- //
router.post(
  '/register',
  authenticate,
  permit('SUPER_ADMIN'),
  userManagementController.registerUser
);
router.delete(
  '/user/:matricule/delete',
  authenticate,
  permit('SUPER_ADMIN'),
  userManagementController.deleteUser
);

export default router;
