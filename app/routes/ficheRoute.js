const express = require("express"); 
const db = require('./../controllers/ficheTechniqueController')
//import verifyAuth from '../middlewares/verifyAuth';

const router = express.Router();

//router.get('/fiches', verifyAuth, getAllBuses);
router.get('/fiches', db.getFiches);

module.exports = {
    router,
}