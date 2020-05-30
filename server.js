const express = require('express');
const bodyParser = require('body-parser');

const ficheController = require('./app/controllers/fiche/ficheTechniqueController');
const productionController = require('./app/controllers/fiche/productionController');
const marcheController = require('./app/controllers/fiche/marcheController');

const analyseController = require('./app/controllers/analyse/analyseTresorieController');

const app = express();

var urlencodedParser = bodyParser.urlencoded({
  extended: true,
});
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

/*app.use(express.static(__dirname + '/app')) */

/*app.get('/',function(req,res){
  res.sendFile('index.html')
});*/

app.get('/fiches', ficheController.getFiches);
app.post('/fiche', ficheController.postFiche);
app.get('/fiche/:id', ficheController.getFicheById);
app.put('/fiche/:id', ficheController.putFicheById);
app.delete('/fiche/:id', ficheController.deleteFicheById);
app.get('/fiche/:id/flux_mensuels', ficheController.getFicheByIdFluxMensuels);
app.get('/fiche/:id/flux_categorie', ficheController.getFicheByIdFluxCategorie);

app.get('/productions', productionController.getProductions);
app.post('/production', productionController.postProduction);
app.get('/production/:id', productionController.getProductionById);
app.put('/production/:id', productionController.putProductionById);
app.delete('/production/:id', productionController.deleteProductionById);

app.get('/marches', marcheController.getMarches);
app.post('/marche', marcheController.postMarche);
app.get('/marche/:id', marcheController.getMarcheById);
app.put('/marche/:id', marcheController.putMarcheById);
app.delete('/marche/:id', marcheController.deleteMarcheById);

app.get('/analyses', analyseController.getAnalyses);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`🚀 L'application tourne sur le port ${PORT}`)
);
