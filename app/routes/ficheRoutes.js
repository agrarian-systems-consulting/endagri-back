import express from 'express';
const router = express.Router();
import ficheController from '../controllers/fiche/ficheController';

router.get('/fiches', ficheController.getFiches);
router.post('/fiche', ficheController.postFiche);
router.get('/fiche/:id', ficheController.getFicheById);
router.put('/fiche/:id', ficheController.putFicheById);
router.delete('/fiche/:id', ficheController.deleteFicheById);

export default router;
