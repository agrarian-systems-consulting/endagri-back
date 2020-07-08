import express from 'express';
const router = express.Router();
import productionController from '../controllers/fiche/productionController';

router.get('/productions', productionController.getProductions);
router.post('/production', productionController.postProduction);
router.get(
  '/production/:id/produits',
  productionController.getProduitsByProductionId
);
router.get('/production/:id', productionController.getProductionById);

router.put('/production/:id', productionController.putProductionById);
router.delete('/production/:id', productionController.deleteProductionById);
router.get('/produits', productionController.getProduits);
router.post('/produit', productionController.addProductToProduction);
router.delete('/produit/:id', productionController.deleteProduct);

export default router;
