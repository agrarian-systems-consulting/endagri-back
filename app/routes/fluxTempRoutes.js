const express = require('express');
const router = express.Router();
const fluxBrutsController = require('../controllers/fluxtemp/fluxBrutsController');

router.get('/fiche/:id/fluxbruts', fluxBrutsController.getFluxBrutsById);

module.exports = router;
