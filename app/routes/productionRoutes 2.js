const express = require('express');
const router = express.Router();
const productionController = require('../controllers/fiche/productionController');

router.get('/productions', productionController.getProductions);
router.post('/production', productionController.postProduction);
router.get('/production/:id', productionController.getProductionById);
router.put('/production/:id', productionController.putProductionById);
router.delete('/production/:id', productionController.deleteProductionById);

module.exports = router;
