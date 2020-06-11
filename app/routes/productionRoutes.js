import express from 'express';
const router = express.Router();
import productionController from '../controllers/fiche/productionController';

router.get('/productions', productionController.getProductions);
router.post('/production', productionController.postProduction);
router.get('/production/:id', productionController.getProductionById);
router.put('/production/:id', productionController.putProductionById);
router.delete('/production/:id', productionController.deleteProductionById);

export default router;
