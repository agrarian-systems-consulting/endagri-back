import express from 'express';
const router = express.Router();
import registerController from '../controllers/utilisateurs/registerController';

router.post('/register', registerController.registerUser);
router.delete('/user/:matricule/delete', registerController.deleteUser);

export default router;
