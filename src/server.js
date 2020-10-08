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
import cors from 'cors';
import morgan from 'morgan';

const app = express(); // Créé le serveur Express
app.use(cors()); // Nécessaire pour accepter les CORS
app.use(morgan('tiny')); // Activation de Morgan, pour les logs en console

// Nécessaire pour parser le contenu des requêtes en json (JE crois que c'est inclu dans express désormais, on pourrait donc écrire express.json())
const urlencodedParser = bodyParser.urlencoded({
  extended: true,
});
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Autres middlewares (authentification etc.)
// TODO :
// - Gérer l'authentification des utilisateurs

// Endpoints
app.use(ficheRoutes);
app.use(activiteRoutes);
app.use(venteRoutes);
app.use(productionRoutes);
app.use(marcheRoutes);
app.use(fluxTempRoutes);
app.use(analyseRoutes);
app.use(depenseLibreRoutes);
app.use(ficheLibreRoutes);

// L'application est lancée depuis le fichier index.js pour permettre à Jest de faire fonctionner les tests
export default app;
