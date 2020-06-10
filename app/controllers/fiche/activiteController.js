import dbConn from '../../db/pool';
import chalk from 'chalk';
import regeneratorRuntime from 'regenerator-runtime';

// ---- CREER UNE NOUVELLE ACTIVITE ----
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
            // Si la requête échoue, reject la Promise
            return reject(error);
          }

          // Récupère l'id de l'activité qui vient d'être créée
          const id_activite = results.rows[0].id;

          // La requête est considérée fullfilled et renvoie l'identifiant de l'activité créée
          resolve(id_activite);
        }
      );
    });
  };

  // Création d'une fonction qui retourne une Promise pour l'ajout d'une dépense
  const promiseDepense = (depense, id_activite) => {
    // Desctructure les données contenues dans la dépense
    const { libelle_depense, montant } = depense;

    return new Promise((resolve, reject) => {
      // Construction de la requête pour créer la dépense
      const postDepenseQuery = `INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES (DEFAULT, $1, $2, $3) RETURNING *`;

      // Envoi de la requête asynchrone
      dbConn.pool.query(
        postDepenseQuery,
        [id_activite, libelle_depense, montant],
        (error, results) => {
          if (error) {
            // Si la requête échoue
            reject(error);
          }

          // Si l'ajout de la dépense réussi
          resolve('Dépense ajoutée', results.rows[0]);
        }
      );
    });
  };

  const asyncPromiseDepense = async (depense, id_activite) => {
    return promiseDepense(depense, id_activite);
  };

  // Permet d'attendre que TOUTES les dépenses ait été ajoutée
  const ajouterDepenses = async (id_activite) => {
    return Promise.all(
      depenses.map((depense) => asyncPromiseDepense(depense, id_activite))
    );
  };

  const getActiviteAvecDepenses = (id_activite) => {
    return new Promise((resolve, reject) => {
      // Créé la requête pour récupérer l'activité avec toutes ses dépenses associées
      const getActiviteAvecDepensesQuery = `SELECT a.*, 
      array_remove(array_agg(d.*),null) depenses 
      FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id=$1 GROUP BY a.id`;

      // Envoi de la requête
      dbConn.pool.query(
        getActiviteAvecDepensesQuery,
        [id_activite],
        (error, results) => {
          if (error) {
            console.log(error);
            throw error;
          }

          // Envoi de la réponse
          resolve(results.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doAjouterActiviteEtDepenses = async () => {
    // Ajouter l'activité
    const id_activite = await promiseAjoutActivite();

    // S'il y a des dépenses, les ajouter en tenant compte de l'id_activite qui vient d'être créée
    if (depenses != undefined) {
      await ajouterDepenses(id_activite);
    }

    // Récupérer l'activité avec ses dépenses associées dans la base de données
    const responseBody = await getActiviteAvecDepenses(id_activite);
    return responseBody;
  };

  // Appel de la fonction asynchrone principale
  doAjouterActiviteEtDepenses()
    .then((result) => {
      // Si les requêtes ont fonctionné, renvoyée un HTTP 201 avec le détail de l'activité et des dépenses
      response.status(201).json(result);
    })
    .catch((e) => console.log(chalk.red.bold(e)));
};

// ---- MODIFIER UNE ACTIVITE ----
// v1 : Gérer le cas ou l'application cliente supprime des dépenses existantes.
const putActivite = (request, response) => {
  // Récupère l'id de l'activité et de la fiche technique depuis les params de l'URL
  const id_fiche_technique = request.params.id_fiche_technique;
  const id_activite = request.params.id_activite;
  // Desctructure les données présentes dans request.body
  const { libelle_activite, mois_relatif, mois, depenses } = request.body;

  // Construction d'une Promise pour la modification d'une activité
  const promiseModifieActivite = () => {
    return new Promise((resolve, reject) => {
      // Contruction de la requête pour mettre à jour l'activité
      const putActiviteQuery = `UPDATE fiche.activite SET libelle=$1, mois_relatif=$2, mois=$3 WHERE id=$4 RETURNING *`;

      // Envoi de la requête
      dbConn.pool.query(
        putActiviteQuery,
        [libelle_activite, mois_relatif, mois, id_activite],
        (error, results) => {
          if (error) {
            reject(error);
          }

          // Si la requête fonctionne, renvoie l'activité qui a été modifiée
          resolve(results.rows[0]);
        }
      );
    });
  };

  // Construction d'une Promise pour récupérer l'activité et ses dépenses associées
  const promiseDeleteAnciennesDepenses = (id_activite) => {
    return new Promise((resolve, reject) => {
      // Créé la requête pour récupérer l'activité avec toutes ses dépenses associées
      const deleteAnciennesDepensesQuery = `DELETE FROM fiche.depense WHERE id_activite=$1 GROUP BY a.id`;

      // Envoi de la requête asynchrone
      dbConn.pool.query(
        deleteAnciennesDepensesQuery,
        [id_activite],
        (error, results) => {
          if (error) {
            reject(error);
          }

          // Si la requête fonctionne
          resolve(results.rows[0]);
        }
      );
    });
  };

  // Création d'une fonction qui retourne une Promise pour l'ajout d'une dépense
  const promiseInsertDepense = (depense, id_activite) => {
    // Desctructure les données contenues dans la dépense
    const { libelle_depense, montant } = depense;

    return new Promise((resolve, reject) => {
      // Construction de la requête pour créer la dépense
      const postDepenseQuery = `INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES (DEFAULT, $1, $2, $3) RETURNING *`;

      // Envoi de la requête asynchrone
      dbConn.pool.query(
        postDepenseQuery,
        [id_activite, libelle_depense, montant],
        (error, results) => {
          if (error) {
            // Si la requête échoue
            reject(error);
          }

          // Si l'ajout de la dépense réussi
          resolve('Dépense ajoutée', results.rows[0]);
        }
      );
    });
  };

  const asyncPromiseInsertDepense = async (depense, id_activite) => {
    return promiseInsertDepense(depense, id_activite);
  };

  // Permet d'attendre que TOUTES les dépenses ait été ajoutée
  const ajouteNouvellesDepenses = async (id_activite) => {
    return Promise.all(
      // TODO INSERT, UPDATE or DELETE ici
      depenses.map((depense) => {
        asyncPromiseInsertDepense(depense, id_activite);
      })
    );
  };

  // Construction d'une Promise pour récupérer l'activité et ses dépenses associées
  const getActiviteAvecDepenses = (id_activite) => {
    return new Promise((resolve, reject) => {
      // Créé la requête pour récupérer l'activité avec toutes ses dépenses associées
      const getActiviteAvecDepensesQuery = `SELECT a.*, array_remove(json_agg(json_build_object('id', d.id,'id_activite', d.id_activite,'libelle', d.libelle,'montant', d.montant)) 
        depenses FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id=$1 GROUP BY a.id`;

      // Envoi de la requête asynchrone
      dbConn.pool.query(
        getActiviteAvecDepensesQuery,
        [id_activite],
        (error, results) => {
          if (error) {
            reject(error);
          }

          // Si la requête fonctionne
          resolve(results.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doModifierActiviteEtDepenses = async (id_activite) => {
    // Modifie les informations principales de l'activité
    await promiseModifieActivite(id_activite);
    await promiseDeleteAnciennesDepenses(id_activite);
    await ajouteNouvellesDepenses(id_activite);

    // Récupérer l'activité avec ses dépenses associées dans la base de données
    const responseBody = await getActiviteAvecDepenses(id_activite);
    return responseBody;
  };

  // Appel de la fonction asynchrone principale
  doModifierActiviteEtDepenses(id_activite)
    .then((result) => {
      // Si les requêtes ont fonctionné, renvoyée un HTTP 201 avec le détail de l'activité et des dépenses
      response.status(201).json(result);
    })
    .catch((e) => console.log(chalk.red.bold(e)));
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
