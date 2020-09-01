"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _ficheTechniqueLibreController = _interopRequireDefault(require("../controllers/analyse/ficheTechniqueLibreController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post('/analyse/:id/fiche-technique-libre', _ficheTechniqueLibreController.default.postFicheTechniqueLibre);
router.get('/analyse/:id/fiche-technique-libre/:id_ftl', _ficheTechniqueLibreController.default.getFicheTechniqueLibre);
router.get('/analyse/:id/fiche-technique-libre/:id_ftl/produits', _ficheTechniqueLibreController.default.getProduitsFromFicheTechniqueLibre);
router.delete('/analyse/:id_analyse/fiche-technique-libre/:id', _ficheTechniqueLibreController.default.deleteFicheTechniqueLibre);
router.post('/coeff_depense', _ficheTechniqueLibreController.default.postCoeffDepense);
router.post('/coeff_vente', _ficheTechniqueLibreController.default.postCoeffVente);
router.delete('/coeff_depense/:id', _ficheTechniqueLibreController.default.deleteCoeffDepense);
router.delete('/coeff_vente/:id', _ficheTechniqueLibreController.default.deleteCoeffVente);
var _default = router;
exports.default = _default;