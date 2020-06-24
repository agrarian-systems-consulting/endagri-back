"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _ficheController = _interopRequireDefault(require("../controllers/fiche/ficheController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.get('/fiches', _ficheController.default.getFiches);
router.post('/fiche', _ficheController.default.postFiche);
router.get('/fiche/:id', _ficheController.default.getFicheById);
router.put('/fiche/:id', _ficheController.default.putFicheById);
router.delete('/fiche/:id', _ficheController.default.deleteFicheById);
var _default = router;
exports.default = _default;