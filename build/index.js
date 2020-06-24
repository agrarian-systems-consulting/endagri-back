"use strict";

var _server = _interopRequireDefault(require("./server"));

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PORT = process.env.PORT || 3333;

_server.default.listen(PORT, () => console.log(_chalk.default.bold(`🚀 L'application tourne sur le port ${PORT}...`)));