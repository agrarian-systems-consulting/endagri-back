"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _marcheController = _interopRequireDefault(require("../controllers/fiche/marcheController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.get('/marches', _marcheController.default.getMarches);
router.post('/marche', _marcheController.default.postMarche);
router.get('/marche/:id', _marcheController.default.getMarcheById);
router.put('/marche/:id', _marcheController.default.putMarcheById);
router.delete('/marche/:id', _marcheController.default.deleteMarcheById);
var _default = router;
exports.default = _default;