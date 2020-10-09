import express from 'express';
const router = express.Router();
import ficheController from '../controllers/fiche/ficheController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

// -- RECUPERER LA LISTE DES FICHES TECHNIQUES (SANS LEUR CONTENU) -- //
router.get(
  '/fiches',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheController.getFiches
);

// -- CREER UNE FICHE TECHNIQUE -- //
router.post(
  '/fiche',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  ficheController.postFiche
);

// -- VOIR UNE FICHE TECHNIQUE -- //
router.get(
  '/fiche/:id',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheController.getFicheById
);

// -- MODIFIER LES METADONNEES D'UNE FICHE TECHNIQUE -- //
router.put(
  '/fiche/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  ficheController.putFicheById
);

// -- SUPPRIMER UNE FICHE TECHNIQUE -- //
router.delete(
  '/fiche/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  ficheController.deleteFicheById
);

export default router;
