"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _analyseController = _interopRequireDefault(require("../controllers/analyse/analyseController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.get('/analyses', _analyseController.default.getAnalyses);
router.post('/analyse', _analyseController.default.postAnalyse);
router.get('/analyse/:id', _analyseController.default.getAnalyseById);
router.put('/analyse/:id', _analyseController.default.putAnalyseById);
router.delete('/analyse/:id', _analyseController.default.deleteAnalyseById);
router.get('/analyse/:id/flux_mois_reels_par_fiches_libres', _analyseController.default.getAnalyseFluxFichesLibresById);
var _default = router;
exports.default = _default;