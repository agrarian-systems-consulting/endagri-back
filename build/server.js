"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _ficheRoutes = _interopRequireDefault(require("./app/routes/ficheRoutes"));

var _activiteRoutes = _interopRequireDefault(require("./app/routes/activiteRoutes"));

var _venteRoutes = _interopRequireDefault(require("./app/routes/venteRoutes"));

var _productionRoutes = _interopRequireDefault(require("./app/routes/productionRoutes"));

var _marcheRoutes = _interopRequireDefault(require("./app/routes/marcheRoutes"));

var _fluxTempRoutes = _interopRequireDefault(require("./app/routes/fluxTempRoutes"));

var _analyseRoutes = _interopRequireDefault(require("./app/routes/analyseRoutes"));

var _depenseLibreRoutes = _interopRequireDefault(require("./app/routes/depenseLibreRoutes"));

var _cors = _interopRequireDefault(require("cors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
app.use((0, _cors.default)());

const urlencodedParser = _bodyParser.default.urlencoded({
  extended: true
});

app.use(_bodyParser.default.json({
  limit: '50mb',
  extended: true
}));
app.use(_bodyParser.default.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(_ficheRoutes.default);
app.use(_activiteRoutes.default);
app.use(_venteRoutes.default);
app.use(_productionRoutes.default);
app.use(_marcheRoutes.default);
app.use(_fluxTempRoutes.default);
app.use(_analyseRoutes.default);
app.use(_depenseLibreRoutes.default);
var _default = app;
exports.default = _default;