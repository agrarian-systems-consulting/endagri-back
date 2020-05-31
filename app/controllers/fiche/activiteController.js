const dbConn = require('../../db/pool');

// CREER UNE NOUVELLE ACTIVITE
// @Asc v1 : Créer le test associé
// @Enda v2 : Gérer id_utilisateur avec la table User
const postActivite = (request, response) => {
  // Récupère l'id de la fiche technique depuis les params
  const id_fiche_technique = request.params.id;

  // Destructure les données contenus dans la requête
  const { libelle_activite, mois, mois_relatif, depenses } = request.body;

  // Construction de la requête pour créer la fiche technique
  const postActiviteQuery =
    'INSERT INTO fiche.activite(id, id_fiche_technique, libelle, mois, mois_relatif) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *';

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
          const postDepenseQuery =
            'INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES (DEFAULT, $1, $2, $3) RETURNING id';

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
    }
  );

  // TODO : Eventuellement renvoyer l'activité et les dépenses créées
  response.sendStatus(200);
};

//
module.exports = {
  postActivite,
  putActivite,
  deleteActivite,
};
