import express from 'express';
import ficheTechniqueLibreController from '../controllers/analyse/ficheTechniqueLibreController';
const router = express.Router();

router.post(
  '/analyse/:id/fiche-technique-libre',
  ficheTechniqueLibreController.postFicheTechniqueLibre
);

router.get(
  '/analyse/:id/fiche-technique-libre/:id_ftl',
  ficheTechniqueLibreController.getFicheTechniqueLibre
);
router.delete(
  '/analyse/:id_analyse/fiche-technique-libre/:id',
  ficheTechniqueLibreController.deleteFicheTechniqueLibre
);
router.post('/coeff_depense', ficheTechniqueLibreController.postCoeffDepense);
router.post('/coeff_vente', ficheTechniqueLibreController.postCoeffVente);
router.delete(
  '/coeff_depense/:id',
  ficheTechniqueLibreController.deleteCoeffDepense
);
router.delete(
  '/coeff_vente/:id',
  ficheTechniqueLibreController.deleteCoeffVente
);

export default router;
