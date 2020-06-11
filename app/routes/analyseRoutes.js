import express from 'express';
import analyseController from '../controllers/analyse/analyseController';
const router = express.Router();

router.get('/analyses', analyseController.getAnalyses);
router.post('/analyse', analyseController.postAnalyse);
router.get('/analyse/:id', analyseController.getAnalyseById);
router.put('/analyse/:id', analyseController.putAnalyseById);
// router.delete('/analyse/:id', analyseController.deleteAnalyseById);
// router.get(
//   '/analyse/:id/flux_mois_reels_par_fiches_libres',
//   analyseController.getAnalyseFluxFichesLibresById
// );
// router.get(
//   '/analyse/:id/flux_mois_reels_par_categories',
//   analyseController.getAnalyseFluxCategoriesById
// );

export default router;
