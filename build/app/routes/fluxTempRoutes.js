"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _fluxBrutsController = _interopRequireDefault(require("../controllers/fluxtemp/fluxBrutsController"));

var _fluxMoisReelsController = _interopRequireDefault(require("../controllers/fluxtemp/fluxMoisReelsController"));

var _fluxMoisReelsMoisController = _interopRequireDefault(require("../controllers/fluxtemp/fluxMoisReelsMoisController"));

var _fluxMoisReelsMoisCatController = _interopRequireDefault(require("../controllers/fluxtemp/fluxMoisReelsMoisCatController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.get('/fiche/:id/fluxbruts', _fluxBrutsController.default.getFluxBrutsById);
router.get('/fiche/:id/flux_mois_reels', _fluxMoisReelsController.default.getFluxMoisReelsById);
router.get('/ventefiche/:id', _fluxMoisReelsController.default.getVenteByIdFiche);
router.get('/vente/:id', _fluxMoisReelsController.default.getVenteById);
router.get('/fiche/:id/flux_mois_reels_mois', _fluxMoisReelsMoisController.default.getFluxMoisReelsByIdByMois);
router.get('/fiche/:id/flux_mois_reels_mois_categorie', _fluxMoisReelsMoisCatController.default.getFluxMoisReelsByIdByMois);
var _default = router;
exports.default = _default;