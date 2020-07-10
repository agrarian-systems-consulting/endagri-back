import express from 'express';
import ficheTechniqueLibreController from '../controllers/analyse/ficheTechniqueLibreController';
const router = express.Router();

router.post(
  '/analyse/:id/fiche-technique-libre',
  ficheTechniqueLibreController.postFicheTechniqueLibre
);
router.delete(
  '/analyse/:id_analyse/fiche-technique-libre/:id',
  ficheTechniqueLibreController.deleteFicheTechniqueLibre
);

export default router;
