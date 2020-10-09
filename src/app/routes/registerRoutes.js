import express from 'express';
const router = express.Router();
import registerController from '../controllers/utilisateurs/registerController';

router.post('/register', registerController.register);

export default router;
