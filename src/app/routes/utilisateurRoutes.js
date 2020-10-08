import express from 'express';
const router = express.Router();
import utilisateursController from '../controllers/utilisateurs/utilisateursController';
import permit from '../../app/middlewares/authorization';

// router.post('/register', activiteController.postActivite);
// router.post('/login', activiteController.postActivite);
// router.get('/me', activiteController.postActivite);
router.get('/utilisateurs', utilisateursController.getUtilisateurs);
router.get('/me', utilisateursController.getToken);

export default router;
