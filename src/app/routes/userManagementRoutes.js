import express from 'express';
const router = express.Router();
import userManagementController from '../controllers/utilisateurs/userManagementController';

router.post('/register', userManagementController.registerUser);
router.delete('/user/:matricule/delete', userManagementController.deleteUser);

export default router;
