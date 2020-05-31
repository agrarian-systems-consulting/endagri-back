const dbConn = require('../../db/pool');

// RECUPERE LA LISTE DES FICHES
// TODO :
// @Asc : Renvoyer le nom de la production en plus de l'id_production
// @Asc : Eventuellement optimiser l'écriture de la fonction avec ou sans le paramètre optionnel id_utilisateur
// @Asc : Ajouter attribut created si easy (Généré par postgre automatiquement lors du post ?)
// @Asc : Ajouter attribut modified si easy (Géré par postgre lors de chaque put ?)
// @ENDA : Renvoyer le fullname de l'utilisateur quand la table User sera implémentée
const getFiches = (request, response) => {
  // Récupère le paramètre optionnel id_utilisateur pour filtrer les fiches techniques
  const id_utilisateur = request.query.id_utilisateur; // J'ai essayé const id_utilisateur = request.query.id_utilisateur || true pour ne pas avoir à créer la condition ci-après mais ne marche pas

  if (id_utilisateur !== undefined) {
    // Construction de la requête pour récupérer la liste des fiches techniques associées à l'id_utilisateur
    const getFichesQuery =
      'SELECT id,id_production,id_utilisateur,libelle FROM fiche.fiche_technique WHERE id_utilisateur=$1 ORDER BY id ASC';

    // Envoi de la requête
    dbConn.pool.query(getFichesQuery, [id_utilisateur], (error, results) => {
      if (error) {
        throw error;
      }

      // Renvoi un array avec les fiches techniques de l'auteur
      response.status(200).send(results.rows);
    });
  } else {
    // Construction de la requête pour récupérer la liste des fiches techniques associées à l'id_utilisateur
    const getFichesQuery =
      'SELECT id,id_production,id_utilisateur,libelle FROM fiche.fiche_technique ORDER BY id ASC';

    // Envoi de la requête
    dbConn.pool.query(getFichesQuery, (error, results) => {
      if (error) {
        throw error;
      }

      // Renvoi un array avec les fiches techniques de l'auteur
      response.status(200).send(results.rows);
    });
  }
};

// CREER UNE NOUVELLE FICHE
// @Asc Trouver le problème :D
// @Enda Gérer id_utilisateur avec la table User
const postFiche = (request, response) => {
  // Destructure les données contenus dans la requête
  const {
    libelle_fiche,
    id_production,
    id_utilisateur,
    ini_debut,
    ini_fin,
    ventes,
    activites,
  } = request.body;

  // Construction de la requête pour créer la fiche technique
  const postFicheQuery =
    'INSERT INTO fiche.fiche_technique(id, id_utilisateur, libelle, id_production, ini_debut, ini_fin) VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING id';

  // Envoi de la requête
  dbConn.pool.query(
    postFicheQuery,
    [id_utilisateur, libelle_fiche, id_production, ini_debut, ini_fin],
    (error, results) => {
      if (error) {
        throw error;
      }

      // Récupère l'id de la nouvelle fiche technique
      const id_fiche_technique = results.rows[0].id;

      // console.log(
      //   `Création de la fiche technique ${id_fiche_technique} : ${libelle_fiche}`
      // );

      // Ajoute les ventes
      if (ventes) {
        ventes.map(
          ({
            id_marche,
            rendement_min,
            rendement,
            rendement_max,
            mois_relatif,
            mois,
          }) => {
            // Construction de la requête pour créer une vente
            const postVenteQuery =
              'INSERT INTO fiche.vente(id, id_fiche_technique, id_marche, rendement_min, rendement, rendement_max, mois_relatif, mois) VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7) RETURNING id';

            // Envoi de la requête
            dbConn.pool.query(
              postVenteQuery,
              [
                id_fiche_technique,
                id_marche,
                rendement_min,
                rendement,
                rendement_max,
                mois_relatif,
                mois,
              ],
              (error, results) => {
                if (error) {
                  throw error;
                }

                // Récupère l'id de la nouvelle vente
                const id_vente = results.rows[0].id;

                // console.log(`Ajout de la vente ${id_vente}`);
              }
            );
          }
        );
      }

      // Ajoute les activités
      if (activites) {
        activites.map(({ libelle_activite, mois_relatif, mois, depenses }) => {
          // Construction de la requête pour créer une activité
          const postActiviteQuery =
            'INSERT INTO fiche.activite(id, id_fiche_technique, libelle, mois_relatif, mois) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING id';

          // Envoi de la requête
          dbConn.pool.query(
            postActiviteQuery,
            [id_fiche_technique, libelle_activite, mois_relatif, mois],
            (error, results) => {
              if (error) {
                throw error;
              }
              // Récupère l'id de la nouvelle activité
              const id_activite = results.rows[0].id;

              // console.log(
              //   `Ajout de l'activité ${id_activite} : ${libelle_activite}`
              // );

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
                      // Récupère l'id de la nouvelle dépense
                      const id_depense = results.rows[0].id;

                      console.log(
                        `Ajout de la dépense ${id_depense} : ${libelle_depense}`
                      );
                    }
                  );
                });
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

// RECUPERE LE CONTENU D'UNE FICHE
// TODO : Créer Vue
const getFicheById = (request, response) => {
  // Récupère l'id de la fiche technique depuis l'URL
  const id_fiche = request.params.id;

  // Construction de la requête pour récupérer la fiche
  const getFicheByIdQuery = `WITH subquery AS(
    SELECT act.mois_relatif,SUM(d.montant) dep,act.id_fiche_technique,f.libelle FROM fiche.activite act LEFT JOIN fiche.depense d ON act.id=d.id_activite 
    JOIN fiche.fiche_technique f ON act.id_fiche_technique=f.id
    GROUP BY act.mois_relatif,act.id_fiche_technique,f.libelle ORDER BY act.mois_relatif 
   )
   SELECT libelle,JSON_AGG(JSON_BUILD_OBJECT('mois relatif',mois_relatif,'depenses',dep)) flux FROM subquery WHERE subquery.id_fiche_technique=$1 
   GROUP BY libelle`;

  // Envoi de la requête
  dbConn.pool.query(getFicheByIdQuery, [id_fiche], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
};

// MODIFIER UNE FICHE
// A DISCUTER de vive voix peut-être
const putFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const { libelle_fiche } = request.body;
  const putFicheByIdQuery =
    'UPDATE fiche.fiche_technique SET libelle=$1 WHERE id=$2';
  dbConn.pool.query(
    putFicheByIdQuery,
    [libelle_fiche, id_fiche],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Update`);
    }
  );
};

// SUPPRIME UNE FICHE
// TODO :
// - Asc : Faire les delete en cascade sur activités, ventes et dépenses (si ce n'est pas déjà le cas dans postgre)
const deleteFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const deleteFicheByIdQuery = 'DELETE FROM fiche.fiche_technique WHERE id=$1';
  dbConn.pool.query(deleteFicheByIdQuery, [id_fiche], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Delete`);
  });
};

// RECUPERE UNE SYNTHESE DES FLUX FINANCIERS PAR MOIS
// TODO :
// - Asc : Créer vue
const getFicheByIdFluxMensuels = (request, response) => {
  // Récupère l'id de la fiche
  const id_fiche = request.params.id;

  // Construction de la requête pour récupérer les flux
  const getFicheByIdFluxMensuelsQuery =
    'SELECT * FROM fiche.fiche_technique WHERE id=$1';
  dbConn.pool.query(
    getFicheByIdFluxMensuelsQuery,
    [id_fiche],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(results.rows);
    }
  );
};

// RECUPERE UNE SYNTHESE DES FLUX FINANCIERS PAR CATEGORIE AVEC CHACUNE DES TRANSACTIONS PAR CATEGORIE
// TODO :
// - Réflechir à la pertinence d'avoir les flux détaillés
// - Asc : Créer vue
const getFicheByIdFluxCategorie = (request, response) => {
  const id_fiche = request.params.id;
  const getFicheByIdFluxCategorieQuery =
    'SELECT * FROM fiche.fiche_technique WHERE id=$1';
  dbConn.pool.query(
    getFicheByIdFluxCategorieQuery,
    [id_fiche],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(results.rows);
    }
  );
};

module.exports = {
  getFiches,
  postFiche,
  getFicheById,
  putFicheById,
  deleteFicheById,
  getFicheByIdFluxMensuels,
  getFicheByIdFluxCategorie,
};
