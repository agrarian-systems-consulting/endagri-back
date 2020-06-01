const dbConn = require('../../db/pool');

// CREER UNE NOUVELLE ACTIVITE
// @Enda v2 : Gérer id_utilisateur avec la table User
const postActivite = (request, response) => {
  // Récupère l'id de la fiche technique depuis les params
  const id_fiche_technique = request.params.id_fiche_technique;

  // Destructure les données contenus dans la requête
  const { libelle_activite, mois, mois_relatif, depenses } = request.body;

  // Construction de la requête pour créer la fiche technique
  const postActiviteQuery = `INSERT INTO fiche.activite(id, id_fiche_technique, libelle, mois, mois_relatif) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *`;

  // Envoi de la requête
  dbConn.pool.query(
    postActiviteQuery,
    [id_fiche_technique, libelle_activite, mois, mois_relatif],
    (error, results) => {
      if (error) {
        throw error;
      }

      // Réupère l'id de l'activité qui vient d'être créée
      const id_activite = results.rows[0].id;

      // Ajoute les dépenses
      if (depenses) {
        depenses.map(({ libelle_depense, montant }) => {
          // Construction de la requête pour créer une dépense
          const postDepenseQuery = `INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES (DEFAULT, $1, $2, $3) RETURNING id`;

          // Envoi de la requête
          dbConn.pool.query(
            postDepenseQuery,
            [id_activite, libelle_depense, montant],
            (error, results) => {
              if (error) {
                throw error;
              }
            }
          );
        });
      }
      // TODO : Eventuellement renvoyer l'activité et les dépenses créées
      response
        .set('Content-Type', 'application/json')
        .status(201)
        .json({ id: id_activite });
    }
  );
};

// MODIFIER UNE ACTIVITE
// @Asc v1 Faut-il inclure les dépenses ici également ? Ou créer des routes PUT depenses et DELETE depense à part ?
// Si on les inclut, il faut s'assurer qu'un PU ne créé pas des dépenses orphelines dans la db
// @Asc v1 ou v2 Gérer comme il faut le Not Found
const putActivite = (request, response) => {
  // Récupère l'id de l'activité et de la fiche technique depuis les params de l'URL
  const id_fiche_technique = request.params.id_fiche_technique; // Sera utile pour tester le droit d'accès de l'utilisateur
  const id_activite = request.params.id_activite;

  const { libelle_activite, mois_relatif, mois } = request.body;

  // Contruction de la requête pour mettre à jour l'activité
  const putActiviteQuery = `UPDATE fiche.activite SET libelle=$1, mois_relatif=$2, mois=$3 WHERE id=$4 RETURNING *`;

  // Envoi de la requête
  dbConn.pool.query(
    putActiviteQuery,
    [libelle_activite, mois_relatif, mois, id_activite],
    (error, results) => {
      if (error) {
        throw error;
      }

      //TODO : Gérer les dépenses ici. S'assurer qu'un update supprimer bien les dépenses qui ont été retirées dans l'activité.

      // console.log(results.rows[0]);
      response.status(200).send(results.rows[0]);
    }
  );
};

// SUPPRIME UNE ACTIVITE
// @Asc v1 Implémenter les DELETE en cascade sur dépenses dans postgre
// @Asc @Enda v1 ou v2 Utiliser les transactions
const deleteActivite = (request, response) => {
  // Récupère l'id de la fiche technique depuis les params de l'URL
  const id_fiche_technique = request.params.id; // A utiliser plus tard pour vérifier les droits de l'utilisateur

  // Récupère l'id de l'activité
  const id_activite = request.params.id_activite;

  const deleteActiviteQuery = `DELETE FROM fiche.activite WHERE id=$1 RETURNING *`;
  dbConn.pool.query(deleteActiviteQuery, [id_activite], (error, results) => {
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
  postActivite,
  putActivite,
  deleteActivite,
};
