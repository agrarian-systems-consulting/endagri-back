import express from 'express';
import bodyParser from 'body-parser';
import ficheRoutes from './app/routes/ficheRoutes';
import activiteRoutes from './app/routes/activiteRoutes';
import venteRoutes from './app/routes/venteRoutes';
import productionRoutes from './app/routes/productionRoutes';
import marcheRoutes from './app/routes/marcheRoutes';
import fluxTempRoutes from './app/routes/fluxTempRoutes';
import analyseRoutes from './app/routes/analyseRoutes';
import depenseLibreRoutes from './app/routes/depenseLibreRoutes';
import ficheLibreRoutes from './app/routes/ficheLibreRoutes';
import loginRoutes from './app/routes/loginRoutes';
import registerRoutes from './app/routes/registerRoutes';
import cors from 'cors';
import morgan from 'morgan';
import authenticate from '../src/app/middlewares/authentication';
import permit from '../src/app/middlewares/authorization';
const app = express(); // Créé le serveur Express
app.use(cors()); // Nécessaire pour accepter les CORS
app.use(morgan('tiny')); // Activation de Morgan

// Nécessaire pour parser le contenu des requêtes en json (JE crois que c'est inclu dans express désormais, on pourrait donc écrire express.json())
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Autres middlewares
// app.use(authenticate); // Gérer l'authentification pour chaque requête, va crééer un `request.user`

// API Endpoints
app.use(loginRoutes);
app.use(registerRoutes);
app.use(authenticate, permit('ADMIN'), ficheRoutes);
app.use(authenticate, permit('ADMIN'), activiteRoutes);
app.use(authenticate, permit('ADMIN'), venteRoutes);
app.use(authenticate, permit('ADMIN'), productionRoutes);
app.use(authenticate, permit('ADMIN'), marcheRoutes);
app.use(authenticate, permit('ADMIN'), fluxTempRoutes);
app.use(authenticate, permit('ADMIN'), analyseRoutes);
app.use(authenticate, permit('ADMIN'), depenseLibreRoutes);
app.use(
  authenticate,
  permit(
    'SUPER_ADMIN',
    'ADMINISTRATEUR_ENDAGRI',
    'AGRONOME_REGIONAL',
    'ANALYSTE_REGIONAL',
    'DIRECTEUR_REGIONAL',
    'COORDINATEUR_OPERATIONNEL',
    'CHEF_D_AGENCE',
    'SUPERVISEUR_DE_PROTEFEUILLE',
    'GESTIONNAIRE_DE_PORTEFEUILLE'
  ),
  ficheLibreRoutes
);

// L'application est lancée depuis le fichier index.js pour permettre à Jest de faire fonctionner les tests
export default app;
