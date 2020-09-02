"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _depenseLibreController = _interopRequireDefault(require("../controllers/analyse/depenseLibreController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.get('/analyse/:id/depenses_libres', _depenseLibreController.default.getAllDepensesLibres);
router.post('/analyse/:id/depense_libre', _depenseLibreController.default.postDepenseLibre);
router.get('/analyse/:id/depense_libre/:id_depense_libre', _depenseLibreController.default.getDepenseLibreById);
router.delete('/analyse/:id/depense_libre/:id_depense_libre', _depenseLibreController.default.deleteDepenseLibre);
var _default = router;
exports.default = _default;