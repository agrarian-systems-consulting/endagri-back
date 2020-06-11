import express from 'express';
import depenseLibre from '../controllers/analyse/depenseLibreController';
const router = express.Router();

router.get('/analyse/:id/depenses_libres', depenseLibre.getAllDepensesLibres);
router.post('/analyse/:id/depense_libre', depenseLibre.postDepenseLibre);
router.get(
  '/analyse/:id/depense_libre/:id_depense_libre',
  depenseLibre.getDepenseLibreById
);

export default router;
