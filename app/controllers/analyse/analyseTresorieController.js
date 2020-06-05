const dbConn = require('../../db/pool')

// CREER JOINTURE
const getAnalyses = (request, response) => {
    const getAnalysesQuery = `SELECT * FROM analyse_fiche.analyse ORDER BY id ASC`;
    dbConn.pool.query(getAnalysesQuery, (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(results.rows)
    })
}

// CREER UNE NOUVELLE FICHE
// @Asc v1 Faire en sorte que la response ne soit renvoyée que lorsque les query pour créer les ventes et activités sont resolved (à voir si on garde dépenses et activités dans ce endpoint quand même)
// @Asc v1 Supprimer id_utilisateur si pose problème tant que la table User n'existe pas
// @Enda v2 Gérer id_utilisateur avec la table User
const postFicheTechniqueLibre = (request, response) => {
  // Destructure les données contenus dans la requête
  const {
    date_ini,
    coeff_surface_ou_nombre_animaux, //swagger à modifier
    coeff_main_oeuvre_familiale,
    coeff_ventes,
    coeff_depenses,
  } = request.body;

  // Construction de la requête pour créer la fiche technique
  const postFicheQuery =
  `INSERT INTO analyse_fiche.fiche_technique_libre(id, date_ini, coeff_surface_ou_nombre_animaux, coeff_main_oeuvre_familiale)
    VALUES (DEFAULT, $1, $2, $3) RETURNING id`;

  // Envoi de la requête
  dbConn.pool.query(
    postFicheQuery,
    [date_ini, coeff_surface_ou_nombre_animaux, coeff_main_oeuvre_familiale],
    (error, results) => {
      if (error) {
        throw error;
      }

      // Récupère l'id de la nouvelle fiche technique
      const id_fiche_technique = results.rows[0].id;

      // Ajoute les coeff ventes
      if (coeff_ventes) {
        coeff_ventes.map(
          ({
            libelle_categorie, //swagger à modifier
            coeff_autoconsommation,
            coeff_intraconsommation,
            coeff_rendement
          }) => {
            const postCoeffVenteQuery =
            `INSERT INTO analyse_fiche.coeff_vente(id, id_fiche_technique_libre,libelle_categorie,coeff_autoconsommation,coeff_intraconsommation,coeff_rendement) 
              VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING id`;

            // Envoi de la requête
            dbConn.pool.query(
              postCoeffVenteQuery,
              [
                id_fiche_technique_libre,
                libelle_categorie, //swagger à modifier
                coeff_autoconsommation,
                coeff_intraconsommation,
                coeff_rendement
              ],
              (error, results) => {
                if (error) {
                  throw error;
                }
              }
            );
          }
        );
      }

      // Ajoute les coeff depenses
      if (coeff_depenses) {
        coeff_depenses.map(({ libelle_categorie, coeff_intraconsommation }) => { // swagger à modifier
          // 
          const postCoeffDepenseQuery =
          `INSERT INTO analyse_fiche.coeff_depense(id, id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation) 
          VALUES (DEFAULT, $1, $2, $3) RETURNING id`;

          // Envoi de la requête
          dbConn.pool.query(
            postCoeffDepenseQuery,
            [id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation],
            (error, results) => {
              if (error) {
                throw error;
              }
            }
          );
        });
      }

      // Retourne l'id de la fiche technique pour rediriger l'application cliente vers la fiche technique qui vient d'être créée
      response
        .set('Content-Type', 'application/json')
        .status(201)
        .json({ id: id_fiche_technique });
    }
  );
};

module.exports = {
    getAnalyses,
    postFicheTechniqueLibre,
}