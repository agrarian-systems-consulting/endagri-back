import express from 'express';
const router = express.Router();
import marcheController from '../controllers/fiche/marcheController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

// -- RECUPERER LA LISTE DES MARCHES SANS LEUR DETAIL -- //
router.get(
  '/marches',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  marcheController.getMarches
);

// -- CREER UN MARCHE -- //
router.post(
  '/marche',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  marcheController.postMarche
);

// -- VOIR LE DETAIL D'UN MARCHE -- //
router.get(
  '/marche/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI', 'AGRONOME_REGIONAL'),
  marcheController.getMarcheById
);

// -- MODIFIER LES PRIX D'UN MARCHE -- //
router.put(
  '/marche/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  marcheController.putMarcheById
);

// -- SUPPRIMER UN MARCHE -- //
router.delete(
  '/marche/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  marcheController.deleteMarcheById
);

export default router;
