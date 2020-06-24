"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _activiteController = _interopRequireDefault(require("../controllers/fiche/activiteController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post('/fiche/:id_fiche_technique/activite', _activiteController.default.postActivite);
router.put('/fiche/:id_fiche_technique/activite/:id_activite', _activiteController.default.putActivite);
router.delete('/fiche/:id_fiche_technique/activite/:id_activite', _activiteController.default.deleteActivite);
var _default = router;
exports.default = _default;