import express from 'express';
import analyseController from '../controllers/analyse/analyseController';
const router = express.Router();
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

// -- RECUPERER LA LISTE DES ANALYSES -- //
router.get(
  '/analyses',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  analyseController.getAnalyses
);

// -- CREER UNE ANALYSE -- //
router.post(
  '/analyse',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  analyseController.postAnalyse
);

// -- LIRE UNE ANALYSE -- //
router.get(
  '/analyse/:id',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  analyseController.getAnalyseById
);

// -- MODIFIER UNE ANALYSE -- //
// TODO : Si GESTIONNAIRE, VERIFIER QU'IL SOIT L'AUTEUR
router.put(
  '/analyse/:id',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  analyseController.putAnalyseById
);

// -- SUPPRIME UNE ANALYSE -- //
router.delete(
  '/analyse/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  analyseController.deleteAnalyseById
);

// -- VOIR LES FLUX DES FICHES LIBRES ASSOCIEES A UNE ANALYSE
router.get(
  '/analyse/:id/flux_mois_reels_par_fiches_libres',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  analyseController.getAnalyseFluxFichesLibresById
);

// router.get(
//   '/analyse/:id/flux_mois_reels_par_categories',
//   analyseController.getAnalyseFluxCategoriesById
// );

export default router;
