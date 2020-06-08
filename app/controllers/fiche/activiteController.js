import dbConn from '../../db/pool';
import chalk from 'chalk';

// CREER UNE NOUVELLE ACTIVITE
// Pour la v2 :
// - Gérer id_utilisateur avec la table User
const postActivite = (request, response) => {
  // Récupère l'id de la fiche technique depuis les params
  const id_fiche_technique = request.params.id_fiche_technique;

  // Destructure les données contenues dans la requête
  const { libelle_activite, mois, mois_relatif, depenses } = request.body;

  // Construction d'une Promise pour l'ajout d'une activité
  const promiseAjoutActivite = () => {
    return new Promise((resolve, reject) => {
      // Construction de la requête pour créer la fiche technique
      const postActiviteQuery = `INSERT INTO fiche.activite(id, id_fiche_technique, libelle, mois, mois_relatif) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *`;

      // Envoi de la requête asynchrone
      dbConn.pool.query(
        postActiviteQuery,
        [id_fiche_technique, libelle_activite, mois, mois_relatif],
        (error, results) => {
          if (error) {
            // La requête a échoué
            console.log(chalk.bgRed.bold(error));
            return reject(error);
          }

          // Décommenter la ligne ci-dessous pour débuguer :
          console.log(
            'POST activite 1 : ' + JSON.stringify(results.rows, true, 2)
          );

          // Récupère l'id de l'activité qui vient d'être créée
          const id_activite = results.rows[0].id;

          // La requête est considérée fullfilled
          resolve(id_activite);
        }
      );
    });
  };

  const promiseDepense = (depense, id_activite) => {
    const { libelle_depense, montant } = depense;
    //a function that returns a promise
    return new Promise((resolve, reject) => {
      // Construction de la requête pour créer une dépense
      const postDepenseQuery = `INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES (DEFAULT, $1, $2, $3) RETURNING *`;

      // Envoi de la requête
      dbConn.pool.query(
        postDepenseQuery,
        [id_activite, libelle_depense, montant],
        (error, results) => {
          console.log(
            'POST activite 2 : ' + JSON.stringify(results.rows, true, 2)
          );
          if (error) {
            reject(error);
          }
          resolve('Dépense ajoutée', results.rows[0]);
        }
      );
    });
  };

  const asyncPromiseDepense = async (depense, id_activite) => {
    return promiseDepense(depense, id_activite);
  };

  const ajouterDepenses = async (id_activite) => {
    return Promise.all(
      depenses.map((depense) => asyncPromiseDepense(depense, id_activite))
    );
  };

  const getActiviteAvecDepenses = (id_activite) => {
    console.log('id_activite', id_activite);
    return new Promise((resolve, reject) => {
      // Créé la requête pour récupérer l'activité avec toutes ses dépenses associées
      const getActiviteAvecDepensesQuery = `SELECT a.*, json_agg(json_build_object('id', d.id,'libelle', d.libelle,'montant', d.montant)) depenses FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id=$1 GROUP BY a.id`;

      // Envoi de la requête
      dbConn.pool.query(
        getActiviteAvecDepensesQuery,
        [id_activite],
        (error, results) => {
          if (error) {
            console.log(error);
            throw error;
          }

          console.log(
            'POST activite 3 : ' + JSON.stringify(results.rows, true, 2)
          );

          // Envoi de la réponse
          resolve(results.rows[0]);
        }
      );
    });
  };

  const doWork = async () => {
    console.log('1');
    const id_activite = await promiseAjoutActivite();
    console.log('2');
    await ajouterDepenses(id_activite);
    console.log('3');
    const responseBody = await getActiviteAvecDepenses(id_activite);
    console.log('4');
    return responseBody;
  };

  doWork()
    .then((result) => {
      response.status(200).json(result);
    })
    .catch((e) => console.log('e', e));
};

// MODIFIER UNE ACTIVITE
// @Asc v1 Important : Gérer le cas ou l'application cliente supprime des dépenses existantes.
// @Asc @Enda v2 Renvoyer un 404 Not Found si la dépense ou l'activité n'existe pas
const putActivite = (request, response) => {
  // Récupère l'id de l'activité et de la fiche technique depuis les params de l'URL
  const id_fiche_technique = request.params.id_fiche_technique; // Sera utile pour tester le droit d'accès de l'utilisateur
  const id_activite = request.params.id_activite;

  // Desctructure les données présentes dans request.body
  const { libelle_activite, mois_relatif, mois, depenses } = request.body;

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

      // console.log('putActivite 1' + JSON.stringify(results.rows[0], true, 2));

      // Mettre à jour les dépenses

      //TODO : Il faudrait supprimer les dépenses qui ont été supprimés par l'application cliente.

      if (depenses) {
        // Boucle sur chacune des dépenses
        depenses.map(({ id, libelle_depense, montant }) => {
          // Si c'est une nouvelle dépense, la créer, sinon modifier l'existante
          if (id === undefined) {
            // Construction de la requête pour créer une dépense
            const postDepenseQuery = `INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES (DEFAULT, $1, $2, $3) RETURNING *`;

            // Envoi de la requête
            dbConn.pool.query(
              postDepenseQuery,
              [id_activite, libelle_depense, montant],
              (error, results) => {
                if (error) {
                  throw error;
                }
                // console.log('putActivite 2' + JSON.stringify(results.rows[0], true, 2));
              }
            );
          } else {
            // Construction de la requête pour modifier une dépense existante
            const putDepenseQuery = `UPDATE fiche.depense SET id_activite=$1, libelle=$2, montant=$3 WHERE id=$4 RETURNING *`;
            // Envoi de la requête
            dbConn.pool.query(
              putDepenseQuery,
              [id_activite, libelle_depense, montant, id],
              (error, results) => {
                if (error) {
                  throw error;
                }

                // console.log(
                //   'putActivite 3' + JSON.stringify(results.rows[0], true, 2)
                // );
              }
            );
          }
        });
      }

      // Créé la requête pour récupérer l'activité avec toutes ses dépenses associées
      const getActiviteAvecDepensesQuery = `SELECT a.*, json_agg(d.*) depenses FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id=$1 GROUP BY a.id`;

      // Envoi de la requête
      dbConn.pool.query(
        getActiviteAvecDepensesQuery,
        [id_activite],
        (error, results) => {
          if (error) {
            throw error;
          }

          // console.log(
          //   'putActivite 4' + JSON.stringify(results.rows[0], true, 2)
          // );

          // Envoi de la réponse
          response.status(200).send(results.rows[0]);
        }
      );
    }
  );
};

// SUPPRIME UNE ACTIVITE
// @Asc v1 Implémenter les DELETE en cascade sur dépenses dans postgre
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
