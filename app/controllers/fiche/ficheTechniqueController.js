const dbConn = require('../../db/pool');

// Question : existe-t'il le concept de transaction pour envoyer plusieurs requêtes d'un coup comme dans Firestore ?

// TODO :
// - Ajouter le paramètre optionnel id_utilisateur. Si présent, ne renvoyer que les fiches créées par cet utilisateur. Peut-être wrapper le tout dans un try catch ?
// - Renvoyer le nom de la production en plus de l'id_production
// - Renvoyer les id au format integer plutôt que string si possible (sans les guillemets autour)
// - Ajouter attribut created (idéalement généré automatiquement lors du post)
// - Ajouter attribut modified (idéalement géré lors du put)
// - Renvoyer le fullname de l'utilisateur quand la table User sera implémentée (Enda)
const getFiches = (request, response) => {
  const getFichesQuery =
    'SELECT id,id_production,id_utilisateur,libelle,ini_debut,ini_fin,commentaire FROM fiche.fiche_technique ORDER BY id ASC';
  dbConn.pool.query(getFichesQuery, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
};

// A DISCUTER
// Je t'ai fait une proposition. Pas mal de nested requests, c'est pas joli. A voir si on laisse comme ça, ou si on met du ES6 async/await.
// J'ai pas du tout testé, il y a peut-être des coquilles.
const postFiche = (request, response) => {
  // Destructurer les données contenus dans la requête
  const {
    libelle_fiche,
    id_utilisateur,
    id_production,
    ini_debut,
    ini_fin,
    ventes,
    activites,
  } = request.body;

  // Construction de la requête pour créer la fiche technique
  const postFicheQuery =
    'INSERT INTO fiche.fiche_technique(id, libelle, id_utilisateur, id_production, ini_debut, ini_fin) VALUES (DEFAULT, $1, $2, $3, $4, $5)';

  // Envoi de la requête
  dbConn.pool.query(
    postFicheQuery,
    [libelle_fiche, id_utilisateur, id_production, ini_debut, ini_fin],
    (error, results) => {
      if (error) {
        throw error;
      }

      console.log(`Création de la fiche technique : ${libelle_fiche}`);

      // TODO Récupérer l'id_fiche_technique pour le mettre dans les activités
      // const id_fiche_technique = results.body.id Là je ne sais pas trop à quoi ressemble results

      // Ajoute les ventes
      ventes.map(
        ({ id_marche, libelle_vente, quantite, mois_relatif, mois }) => {
          // Construction de la requête pour créer une vente
          const postVenteQuery =
            'INSERT INTO fiche.vente(id, id_marche, libelle_vente, quantite, mois_relatif, mois) VALUES (DEFAULT, $1, $2, $3, $4, $5)';

          // Envoi de la requête
          dbConn.pool.query(
            postActiviteQuery,
            [id_fiche_technique, libelle_activite, mois_relatif, mois],
            (error, results) => {
              if (error) {
                throw error;
              }

              console.log(`Ajout d'une vente ${libelle_vente}`);
            }
          );
        }
      );

      // Ajoute les activités
      activites.map(({ libelle_activite, mois_relatif, mois, depenses }) => {
        // Construction de la requête pour créer une activité
        const postActiviteQuery =
          'INSERT INTO fiche.activite(id, id_fiche_technique, libelle, mois_relatif, mois) VALUES (DEFAULT, $1, $2, $3, $4)';

        // Envoi de la requête
        dbConn.pool.query(
          postActiviteQuery,
          [id_fiche_technique, libelle_activite, mois_relatif, mois],
          (error, results) => {
            if (error) {
              throw error;
            }

            console.log(`Ajout d'une activité : ${libelle_activite}`);

            // TODO : Récupérer l'id de l'activité pour attacher les dépenses
            // const id_activite = results.body.id Là je ne sais pas trop à quoi ressemble results

            // Ajoute les dépenses
            depenses.map(({ libelle_depense, montant }) => {
              // Requête pour créer une dépense
              const postDepenseQuery =
                'INSERT INTO fiche.activite(id, id_activite, libelle_depense, montant) VALUES (DEFAULT, $1, $2, $3)';

              // Envoi de la requête
              dbConn.pool.query(
                postDepenseQuery,
                [id_activite, libelle_depense, montant],
                (error, results) => {
                  if (error) {
                    throw error;
                  }

                  console.log(`Ajout d'une dépense : ${libelle_depense}`);
                }
              );
            });
          }
        );
      });

      // Retourne l'id de la fiche technique pour rediriger
      // l'application cliente vers la fiche technique qui vient d'être créée
      // response.status(201).send(id_fiche_technique);
    }
  );
};

// CREER VUE
const getFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const getFicheByIdQuery = `WITH subquery AS(
    SELECT act.mois_relatif,SUM(d.montant) dep,act.id_fiche_technique,f.libelle FROM fiche.activite act LEFT JOIN fiche.depense d ON act.id=d.id_activite 
    JOIN fiche.fiche_technique f ON act.id_fiche_technique=f.id
    GROUP BY act.mois_relatif,act.id_fiche_technique,f.libelle ORDER BY act.mois_relatif 
   )
   SELECT libelle,JSON_AGG(JSON_BUILD_OBJECT('mois relatif',mois_relatif,'depenses',dep)) flux FROM subquery WHERE subquery.id_fiche_technique=$1 
   GROUP BY libelle`;
  dbConn.pool.query(getFicheByIdQuery, [id_fiche], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
};

// A DISCUTER
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

// DONE
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

// CREER VUE
const getFicheByIdFluxMensuels = (request, response) => {
  const id_fiche = request.params.id;
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

// CREER VUE
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
