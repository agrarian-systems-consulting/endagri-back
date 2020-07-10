import express from 'express';
import ficheTechniqueLibreController from '../controllers/analyse/ficheTechniqueLibreController';
const router = express.Router();

router.post(
  '/analyse/:id/fiche-technique-libre',
  ficheTechniqueLibreController.postFicheTechniqueLibre
);

export default router;
