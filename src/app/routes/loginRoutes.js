import express from 'express';
const router = express.Router();
import loginController from '../controllers/utilisateurs/loginController';

router.post('/login', loginController.login);

export default router;
