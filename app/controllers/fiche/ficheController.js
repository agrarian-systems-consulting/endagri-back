import dbConn from '../../db/pool';

// Encore des tests à créer
// Transformer postFiche avec des Promises

// ----- RECUPERE LA LISTE DES FICHES ----- //
const getFiches = (request, response) => {
  // Récupère le paramètre optionnel id_utilisateur pour filtrer les fiches techniques
  const id_utilisateur = request.query.id_utilisateur; // J'ai essayé const id_utilisateur = request.query.id_utilisateur || true pour ne pas avoir à créer la condition ci-après mais ne marche pas

  if (id_utilisateur !== undefined) {
    // Construction de la requête pour récupérer la liste des fiches techniques associées à l'id_utilisateur
    const getFichesQuery =
      'SELECT f.id, f.id_production, f.id_utilisateur, f.libelle, p.libelle as libelle_production FROM fiche.fiche_technique f LEFT JOIN fiche.production p ON f.id_production = p.id  WHERE f.id_utilisateur=$1 ORDER BY f.id ASC';

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
    const getFichesQuery = `SELECT f.id, f.id_production, f.id_utilisateur, f.libelle, p.libelle as libelle_production FROM fiche.fiche_technique f 
    JOIN fiche.production p ON f.id_production = p.id ORDER BY f.id ASC`;

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

// ------ CREER UNE NOUVELLE FICHE ------ //
// Faire en sorte que la response ne soit renvoyée que lorsque les query pour créer les ventes et activités sont resolved (à voir si on garde dépenses et activités dans ce endpoint quand même)
const postFiche = (request, response) => {
  const {
    libelle_fiche,
    id_production,
    id_utilisateur,
    ini_debut,
    ini_fin,
    ventes,
    activites,
  } = request.body;

  dbConn.pool.query(
    `INSERT INTO fiche.fiche_technique(id, id_utilisateur, libelle, id_production, ini_debut, ini_fin) VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING id`,
    [id_utilisateur, libelle_fiche, id_production, ini_debut, ini_fin],
    (err, res) => {
      if (err) {
        throw err;
      }

      // Récupère l'id de la nouvelle fiche technique
      const id_fiche_technique = res.rows[0].id;

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
            const postVenteQuery = `INSERT INTO fiche.vente(id, id_fiche_technique, id_marche, rendement_min, rendement, rendement_max, mois_relatif, mois) 
            VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7) RETURNING id`;

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
              }
            );
          }
        );
      }

      // Ajoute les activités
      if (activites) {
        activites.map(({ libelle_activite, mois_relatif, mois, depenses }) => {
          // Construction de la requête pour créer une activité
          const postActiviteQuery = `INSERT INTO fiche.activite(id, id_fiche_technique, libelle, mois_relatif, mois) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING id`;

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

// ---- RECUPERE LE CONTENU D'UNE FICHE ---- //
// Créer un test
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

// ------ MODIFIER UNE FICHE ------ //
// Créer un test
const putFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const { libelle_fiche, ini_debut, ini_fin, commentaire } = request.body;
  const putFicheByIdQuery = `UPDATE fiche.fiche_technique SET libelle=$1, ini_debut=$2, ini_fin=$3, commentaire=$4 WHERE id=$5 RETURNING *`;
  dbConn.pool.query(
    putFicheByIdQuery,
    [libelle_fiche, ini_debut, ini_fin, commentaire, id_fiche],
    (err, res) => {
      if (err) {
        throw err;
      }
      if (res.rows[0].id !== undefined) {
        response.status(200).send(res.rows[0]);
      } else {
        response.sendStatus(404);
      }
    }
  );
};

// ----- SUPPRIMER UNE FICHE ----- //
// Créer un test
const deleteFicheById = (request, response) => {
  const id_fiche = request.params.id;

  dbConn.pool.query(
    `DELETE FROM fiche.fiche_technique WHERE id=$1 RETURNING *`,
    [id_fiche],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0].id !== undefined) {
        response.status(204).send(results.rows[0]);
      } else {
        response.sendStatus(404);
      }
    }
  );
};

export { getFiches, postFiche, getFicheById, putFicheById, deleteFicheById };
