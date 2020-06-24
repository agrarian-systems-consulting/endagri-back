import express from 'express';
const router = express.Router();
import activiteController from '../controllers/fiche/activiteController';

router.post(
  '/fiche/:id_fiche_technique/activite',
  activiteController.postActivite
);
router.put(
  '/fiche/:id_fiche_technique/activite/:id_activite',
  activiteController.putActivite
);
router.delete(
  '/fiche/:id_fiche_technique/activite/:id_activite',
  activiteController.deleteActivite
);

export default router;
