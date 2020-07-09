"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _productionController = _interopRequireDefault(require("../controllers/fiche/productionController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.get('/productions', _productionController.default.getProductions);
router.post('/production', _productionController.default.postProduction);
router.get('/production/:id/produits', _productionController.default.getProduitsByProductionId);
router.get('/production/:id', _productionController.default.getProductionById);
router.put('/production/:id', _productionController.default.putProductionById);
router.delete('/production/:id', _productionController.default.deleteProductionById);
router.get('/produits', _productionController.default.getProduits);
router.post('/produit', _productionController.default.addProductToProduction);
router.delete('/produit/:id', _productionController.default.deleteProduct);
var _default = router;
exports.default = _default;