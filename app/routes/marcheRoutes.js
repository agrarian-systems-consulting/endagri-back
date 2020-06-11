import express from 'express';
const router = express.Router();
import marcheController from '../controllers/fiche/marcheController';

router.get('/marches', marcheController.getMarches);
router.post('/marche', marcheController.postMarche);
router.get('/marche/:id', marcheController.getMarcheById);
router.put('/marche/:id', marcheController.putMarcheById);
router.delete('/marche/:id', marcheController.deleteMarcheById);

export default router;
