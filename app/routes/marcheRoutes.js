const express = require('express');
const router = express.Router();
const marcheController = require('../controllers/fiche/marcheController');

router.get('/marches', marcheController.getMarches);
router.post('/marche', marcheController.postMarche);
router.get('/marche/:id', marcheController.getMarcheById);
router.put('/marche/:id', marcheController.putMarcheById);
router.delete('/marche/:id', marcheController.deleteMarcheById);

module.exports = router;
