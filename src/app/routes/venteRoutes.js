import express from 'express';
const router = express.Router();
import venteController from '../controllers/fiche/venteController';

router.post('/fiche/:id/vente', venteController.postVente);
router.put('/fiche/:id/vente/:id_vente', venteController.putVente);
router.delete('/fiche/:id/vente/:id_vente', venteController.deleteVente);

export default router;
