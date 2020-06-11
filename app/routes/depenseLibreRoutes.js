import express from 'express';
import depenseLibre from '../controllers/analyse/depenseLibreController';
const router = express.Router();

router.get('/analyse/:id/depenses_libres', depenseLibre.getAllDepensesLibres);

export default router;
