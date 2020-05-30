const dbConn = require('../../db/pool');

// LISTE DES MARCHES
//TODO :
// - Asc : Créer jointure avec la table Produit (et peut-être même avec Production idéalement)
// Ca permettrait de montrer les marchés production > produit > marchés associés avec des GROUP BY
// A discuter
const getMarches = (request, response) => {
  const getMarchesQuery = `SELECT id,id_produit,type_marche,localisation,prix_janvier,prix_fevrier,prix_mars,prix_avril,prix_mai,prix_juin
    prix_juillet,prix_aout,prix_septembre,prix_octobre,prix_novembre,prix_decembre FROM fiche.marche ORDER BY id ASC`;
  dbConn.pool.query(getMarchesQuery, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
};

// A DISCUTER
const postMarche = (request, response) => {
  const { id_produit, type_marche } = request.body;
  const postMarcheQuery =
    'INSERT INTO fiche.marche(id,id_produit,type_marche) VALUES (DEFAULT, $1,$2)';
  dbConn.pool.query(
    postMarcheQuery,
    [id_produit, type_marche],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Create`);
    }
  );
};

// CREER VUE
const getMarcheById = (request, response) => {
  const id_marche = request.params.id;
  const getMarcheByIdQuery = `SELECT id,id_produit,type_marche,localisation,prix_janvier,prix_fevrier,prix_mars,prix_avril,prix_mai,prix_juin
  prix_juillet,prix_aout,prix_septembre,prix_octobre,prix_novembre,prix_decembre FROM fiche.marche WHERE id=$1`;
  dbConn.pool.query(getMarcheByIdQuery, [id_marche], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
};

// A DISCUTER
const putMarcheById = (request, response) => {
  const id_marche = request.params.id;
  const { id_produit, type_marche } = request.body;
  const putMarcheByIdQuery =
    'UPDATE fiche.marche SET id_produit=$1, type_marche=$2 WHERE id=$3';
  dbConn.pool.query(
    putMarcheByIdQuery,
    [id_produit, type_marche, id_marche],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Update`);
    }
  );
};

// DONE
const deleteMarcheById = (request, response) => {
  const id_marche = request.params.id;
  const deleteMarcheByIdQuery = 'DELETE FROM fiche.marche WHERE id=$1';
  dbConn.pool.query(deleteMarcheByIdQuery, [id_marche], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Delete`);
  });
};

module.exports = {
  getMarches,
  postMarche,
  getMarcheById,
  putMarcheById,
  deleteMarcheById,
};
