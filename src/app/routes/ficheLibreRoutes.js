import express from 'express';
import ficheTechniqueLibreController from '../controllers/analyse/ficheTechniqueLibreController';
const router = express.Router();
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

// -- AJOUTER UNE FICHE TECHNIQUE LIBRE DANS UNE ANALYSE -- //
router.post(
  '/analyse/:id/fiche-technique-libre',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheTechniqueLibreController.postFicheTechniqueLibre
);

// -- VOIR UNE FICHE TECHNIQUE LIBRE DANS UNE ANALYSE -- //
router.get(
  '/analyse/:id/fiche-technique-libre/:id_ftl',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheTechniqueLibreController.getFicheTechniqueLibre
);

// -- RECUPERER LA LISTE DES PRODUITS ASSOCIEES A UNE FICHE TECHNIQUE LIBRE DANS UNE ANALYSE -- //
router.get(
  '/analyse/:id/fiche-technique-libre/:id_ftl/produits',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheTechniqueLibreController.getProduitsFromFicheTechniqueLibre
);

// -- SUPPRIMER UNE FICHE TECHNIQUE LIBRE ASSOCIEE A UNE ANALYSE -- //
router.delete(
  '/analyse/:id_analyse/fiche-technique-libre/:id',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheTechniqueLibreController.deleteFicheTechniqueLibre
);

// -- AJOUTER UN COEFFICIENT SUR LES DEPENSES D'UNE FICHE TECHNIQUE LIBRE ASSOCIEE A UNE ANALYSE -- //
router.post(
  '/coeff_depense',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheTechniqueLibreController.postCoeffDepense
);

// -- AJOUTER UN COEFFICIENT SUR LES VENTES D'UNE FICHE TECHNIQUE LIBRE ASSOCIEE A UNE ANALYSE -- //
router.post(
  '/coeff_vente',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheTechniqueLibreController.postCoeffVente
);

// -- SUPPRIMER UN COEFFICIENT SUR LES DEPENSES D'UNE FICHE TECHNIQUE LIBRE ASSOCIEE A UNE ANALYSE -- //
router.delete(
  '/coeff_depense/:id',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheTechniqueLibreController.deleteCoeffDepense
);

// -- SUPPRIMER UN COEFFICIENT SUR LES VENTES D'UNE FICHE TECHNIQUE LIBRE ASSOCIEE A UNE ANALYSE -- //
router.delete(
  '/coeff_vente/:id',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheTechniqueLibreController.deleteCoeffVente
);

export default router;
