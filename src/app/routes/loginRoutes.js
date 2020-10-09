import express from 'express';
const router = express.Router();
import loginController from '../controllers/utilisateurs/loginController';

router.get('/login', loginController.login);

export default router;
