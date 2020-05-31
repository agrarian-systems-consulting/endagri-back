const express = require('express');
const router = express.Router();
const venteController = require('../controllers/fiche/venteController');

router.post('/fiche/:id/vente', venteController.postActivite);
// A modifier SWAGGER
router.put('/fiche/:id/vente/:id_vente', venteController.putActivite);
router.delete('/fiche/:id/vente/:id_vente', venteController.deleteActivite);

module.exports = router;
