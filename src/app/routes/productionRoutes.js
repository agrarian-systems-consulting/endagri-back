import express from 'express';
const router = express.Router();
import productionController from '../controllers/fiche/productionController';
import authenticate from '../../app/middlewares/authentication';
import permit from '../../app/middlewares/authorization';

// -- RECUPERER LA LISTE DE TOUTES LES PRODUCTIONS -- //
router.get(
  '/productions',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI', 'AGRONOME_REGIONAL'),
  productionController.getProductions
);

// -- CREER UNE PRODUCTION -- //
router.post(
  '/production',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  productionController.postProduction
);

// -- RECUPERER LA LISTE DES PRODUITS ASSOCIES A UNE PRODUCTION
router.get(
  '/production/:id/produits',
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'SUPERVISEUR_AGENCE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  productionController.getProduitsByProductionId
);

// -- VOIR UNE PRODUCTION ET SES PRODUiTS ASSOCIES -- //
router.get(
  '/production/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI', 'AGRONOME_REGIONAL'),
  productionController.getProductionById
);

// -- MODIFIER UNE PRODUCTION -- //
router.put(
  '/production/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  productionController.putProductionById
);

// -- SUPPRIMER UNE PRODUCTION ET SES PRODUITS ASSOCIES -- //
router.delete(
  '/production/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  productionController.deleteProductionById
);

// -- RECUPERER LA LISTE DE TOUS LES PRODUITS -- //
router.get(
  '/produits',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  productionController.getProduits
);

// -- VOIR UN PRODUIT -- //
router.post(
  '/produit',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI', 'AGRONOME_REGIONAL'),
  productionController.addProductToProduction
);

// -- SUPPRIMER UN PRODUIT -- //
router.delete(
  '/produit/:id',
  authenticate,
  permit('SUPER_ADMIN', 'ADMINISTRATEUR_ENDAGRI'),
  productionController.deleteProduct
);

export default router;
