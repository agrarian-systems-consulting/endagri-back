"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _venteController = _interopRequireDefault(require("../controllers/fiche/venteController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post('/fiche/:id/vente', _venteController.default.postVente);
router.put('/fiche/:id/vente/:id_vente', _venteController.default.putVente);
router.delete('/fiche/:id/vente/:id_vente', _venteController.default.deleteVente);
var _default = router;
exports.default = _default;