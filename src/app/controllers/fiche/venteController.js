import dbConn from '../../db/pool';

// ---- AJOUTER UNE VENTE --- //
const postVente = (request, response) => {
  const id_fiche_technique = request.params.id;

  const {
    id_marche,
    mois,
    mois_relatif,
    rendement_min,
    rendement,
    rendement_max,
  } = request.body;

  dbConn.pool.query(
    `INSERT INTO fiche.vente(id, id_fiche_technique, id_marche, mois, mois_relatif, rendement_min, rendement, rendement_max) 
  VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7) RETURNING id, id_marche, mois, mois_relatif, rendement_min, rendement, rendement_max`,
    [
      id_fiche_technique,
      id_marche,
      mois,
      mois_relatif,
      rendement_min,
      rendement,
      rendement_max,
    ],
    (err, res) => {
      if (err) {
        console.error(err);
        response.sendStatus(500);
      }
      dbConn.pool.query(
        `SELECT 
          v.id, 
          v.id_marche, 
          v.mois, 
          v.mois_relatif, 
          v.rendement_min, 
          v.rendement, 
          v.rendement_max,
          m.localisation,
          m.type_marche,
          p.libelle libelle_produit,
          p.unite
        FROM fiche.vente v
        LEFT JOIN fiche.marche m ON v.id_marche = m.id
        LEFT JOIN fiche.produit p ON m.id_produit = p.id
        WHERE v.id=$1
        GROUP BY v.id, m.id, p.id`,
        [res.rows[0].id],
        (err, res) => {
          if (err) {
            console.error(err);
            response.sendStatus(500);
          }
          console.log(res.rows[0]);
          response.status(201).send(res.rows[0]);
        }
      );
    }
  );
};

// --- MODIFIER UNE VENTE --- //
const putVente = (request, response) => {
  const id_fiche_technique = request.params.id;
  const id_vente = request.params.id_vente;

  const {
    id_marche,
    mois,
    mois_relatif,
    rendement_min,
    rendement,
    rendement_max,
  } = request.body;

  const putVenteQuery = `UPDATE fiche.vente SET id_marche=$1, mois=$2, mois_relatif=$3, rendement_min=$4, rendement=$5, rendement_max=$6 WHERE id=$7 RETURNING id, id_marche, mois, mois_relatif, rendement_min, rendement, rendement_max`;
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
        console.error(error);
        response.sendStatus(500);
      }

      response.status(200).send(results.rows[0]);
    }
  );
};

// ---- SUPPRIME UNE VENTE ---- //
const deleteVente = (request, response) => {
  const id_fiche_technique = request.params.id;
  const id_vente = request.params.id_vente;

  const deleteVenteQuery = 'DELETE FROM fiche.vente WHERE id=$1 RETURNING *';
  dbConn.pool.query(deleteVenteQuery, [id_vente], (error, results) => {
    if (error) {
      console.error(error);
      response.sendStatus(500);
    }

    if (results.rows[0] !== undefined) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  });
};

export default { postVente, putVente, deleteVente };
