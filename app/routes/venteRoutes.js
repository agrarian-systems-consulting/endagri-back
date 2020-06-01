const express = require('express');
const router = express.Router();
const venteController = require('../controllers/fiche/venteController');

router.post('/fiche/:id/vente', venteController.postVente);
router.put('/fiche/:id/vente/:id_vente', venteController.putVente);
router.delete('/fiche/:id/vente/:id_vente', venteController.deleteVente);

module.exports = router;
