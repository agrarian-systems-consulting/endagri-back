const express = require('express');
const bodyParser = require('body-parser');

const ficheRoutes = require('./app/routes/ficheRoutes');
const activiteRoutes = require('./app/routes/activiteRoutes');
const venteRoutes = require('./app/routes/venteRoutes');
const productionRoutes = require('./app/routes/productionRoutes');
const marcheRoutes = require('./app/routes/marcheRoutes');
const fluxTempRoutes = require('./app/routes/fluxTempRoutes');
const analyseRoutes = require('./app/routes/analyseRoutes');

// Crée le serveur Express
const app = express();

// Nécessaire pour parser le contenu des requêtes en json
var urlencodedParser = bodyParser.urlencoded({
  extended: true,
});
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Autres middlewares (authentification etc.)
// TODO :
// - @Enda Gérer l'authentification des utilisateurs

// Endpoints
app.use(ficheRoutes);
app.use(activiteRoutes);
app.use(venteRoutes);
app.use(productionRoutes);
app.use(marcheRoutes);
app.use(fluxTempRoutes);
app.use(analyseRoutes);

// L'application est lancée depuis le fichier index.js pour permettre à Jest de faire fonctionner les tests

module.exports = app;
