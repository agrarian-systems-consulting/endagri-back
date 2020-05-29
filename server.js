const express = require("express"); 
const bodyParser = require('body-parser');

const ficheController = require('./app/controllers/ficheTechniqueController')

const app = express();

var urlencodedParser = bodyParser.urlencoded({
    extended: true
});
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

/*app.use(express.static(__dirname + '/app')) */

/*app.get('/',function(req,res){
  res.sendFile('index.html')
});*/

app.get('/fiches', ficheController.getFiches)
app.post('/fiche', ficheController.postFiche)
app.get('/fiche/:id', ficheController.getFicheById)
app.put('/fiche/:id', ficheController.putFicheById)
app.delete('/fiche/:id', ficheController.deleteFicheById)

const port = 3333;
app.listen(port, () => console.log(`Listening on port ${port}`));