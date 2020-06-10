import dbConn from '../../db/pool';

const postVente = (request, response) => {
  // Récupère l'id de la fiche technique depuis les params
  const id_fiche_technique = request.params.id;

  // Destructure les données contenus dans la requête
  const {
    id_marche,
    mois,
    mois_relatif,
    rendement_min,
    rendement,
    rendement_max,
  } = request.body;

  // Construction de la requête pour créer la fiche technique
  const postVenteQuery = `INSERT INTO fiche.vente(id, id_fiche_technique, id_marche, mois, mois_relatif, rendement_min, rendement, rendement_max) 
  VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7)`;

  // Envoi de la requête
  dbConn.pool.query(
    postVenteQuery,
    [
      id_fiche_technique,
      id_marche,
      mois,
      mois_relatif,
      rendement_min,
      rendement,
      rendement_max,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
    }
  );

  response.sendStatus(200);
};

// SWAGGER A MODIFIER
const putVente = (request, response) => {
  // Récupère l'id de la vente et de la fiche technique depuis les params de l'URL
  const id_fiche_technique = request.params.id; // Sera utile pour tester le droit d'accès de l'utilisateur
  const id_vente = request.params.id;

  const {
    id_marche,
    mois,
    mois_relatif,
    rendement_min,
    rendement,
    rendement_max,
  } = request.body;

  const putVenteQuery = `UPDATE fiche.vente SET id_marche=$1, mois=$2, mois_relatif=$3, rendement_min=$4, rendement=$5, rendement_max=$6 WHERE id=$7 RETURNING *`; //id_fiche_technique?
  dbConn.pool.query(
    putVenteQuery,
    [
      id_marche,
      mois,
      mois_relatif,
      rendement_min,
      rendement,
      rendement_max,
      id_vente,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      // console.log(results.rows[0]);
      response.status(200).send(results.rows[0]);
    }
  );
};

// SUPPRIME UNE VENTE SWAGGER A MODIFIER
// @Asc @Enda v1 ou v2 Utiliser les transactions
const deleteVente = (request, response) => {
  // Récupère l'id de la vente et de la fiche technique depuis les params de l'URL
  const id_fiche_technique = request.params.id; // Sera utile pour tester le droit d'accès de l'utilisateur
  const id_vente = request.params.id;

  const deleteVenteQuery = 'DELETE FROM fiche.vente WHERE id=$1 RETURNING *';
  dbConn.pool.query(deleteVenteQuery, [id_vente], (error, results) => {
    if (error) {
      throw error;
    }
    // console.log(results.rows);
    if (results.rows[0] !== undefined) {
      // console.log('Deleted : ' + JSON.stringify(results.rows[0], true, 2));
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  });
};

module.exports = {
  postVente,
  putVente,
  deleteVente,
};
