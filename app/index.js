import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';

// Créer une instance Express
const app = express();

// Nécessaire pour parser les requêtes json
var urlencodedParser = bodyParser.urlencoded({
  extended: true,
});
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes en liens avec les fiches techniques cultures et élevages
app.use('/', routes.fiches);

// Routes en lien avec les productions et leurs produits (Blé : Paille de blé et Grains de blé)
app.use('/', routes.productions);

// Routes en lien avec marchés (prix des produits selon le mode de vente)
app.use('/', routes.marches);

// app.get('/analyses', analyseController.getAnalyses);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🚀 Le serveur tourne sur le port ${PORT}`));
