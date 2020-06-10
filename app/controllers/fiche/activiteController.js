import dbConn from '../../db/pool';
import chalk from 'chalk';

// ---- CREER UNE NOUVELLE ACTIVITE ---- //
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

  // Permet d'attendre que TOUTES les dépenses ait été ajoutées
  const ajouterDepenses = async (id_activite) => {
    return Promise.all(
      depenses.map((depense) => asyncPromiseDepense(depense, id_activite))
    );
  };

  const getActiviteAvecDepenses = (id_activite) => {
    return new Promise((resolve, reject) => {
      // Créé la requête pour récupérer l'activité avec toutes ses dépenses associées
      const getActiviteAvecDepensesQuery = `SELECT a.*, json_agg(json_build_object('id', d.id,'libelle', d.libelle,'montant', d.montant)) depenses 
      FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id=$1 GROUP BY a.id`;

      // Envoi de la requête
      dbConn.pool.query(
        getActiviteAvecDepensesQuery,
        [id_activite],
        (error, results) => {
          if (error) {
            reject(error);
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

// ------ MODIFIER UNE ACTIVITE ------ //
// Problème mineur : N'await pas que toutes les dépenses soient ajoutée avec de faire le SELECT Prolème lié au Promise.all je suppose.
const putActivite = (request, response) => {
  const id_fiche_technique = request.params.id_fiche_technique;
  const id_activite = request.params.id_activite;
  const { libelle_activite, mois_relatif, mois, depenses } = request.body;

  // Construction d'une Promise pour la modification d'une activité
  const updateActivite = () => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `UPDATE fiche.activite SET libelle=$1, mois_relatif=$2, mois=$3 WHERE id=$4 RETURNING *`,
        [libelle_activite, mois_relatif, mois, id_activite],
        (err, res) => {
          if (err) {
            reject(err);
          }
          // console.log(chalk.inverse.green('Step 1 - Activité mise à jour'));
          resolve(res.rows[0]);
        }
      );
    });
  };

  // Construction d'une Promise pour récupérer l'activité et ses dépenses associées
  const deletePreviousDepenses = () => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `DELETE FROM fiche.depense WHERE id_activite=$1 RETURNING id`,
        [id_activite],
        (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res.rows);
          // console
          //   .log
          // chalk.inverse.green(
          //   'Step 2 - Les anciennes dépenses sont supprimées'
          // )
        }
      );
    });
  };

  // Création d'une fonction qui retourne une Promise pour l'ajout d'une dépense
  const promiseInsertDepense = (depense) => {
    const { libelle_depense, montant } = depense;
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES (DEFAULT, $1, $2, $3) RETURNING *`,
        [id_activite, libelle_depense, montant],
        (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res.rows[0]);
          // console.log(
          //   chalk.inverse.green('Step 3 - Une nouvelle dépense ajoutée')
          // );
        }
      );
    });
  };

  const asyncPromiseInsertDepense = async (depense) => {
    return promiseInsertDepense(depense);
  };

  // Permet d'attendre que TOUTES les dépenses aient été ajoutées
  const ajouteNouvellesDepenses = async (depenses) => {
    return Promise.all(
      depenses.map((depense) => {
        asyncPromiseInsertDepense(depense);
      })
    );
  };

  // Construction d'une Promise pour récupérer l'activité et ses dépenses associées
  const getActiviteAvecDepenses = () => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `SELECT a.*, json_agg(json_build_object('id', d.id,'libelle', d.libelle,'montant', d.montant)) depenses 
        FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id=$1 GROUP BY a.id`,
        [id_activite],
        (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res.rows[0]);
          // console.log(
          //   chalk.inverse.green(
          //     "Step 4 - L'activité est récupérée avec les dépenses associées"
          //   )
          // );
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doModifierActiviteEtDepenses = async () => {
    await updateActivite(id_activite);
    await deletePreviousDepenses(id_activite);

    if (depenses !== undefined) {
      // Problème : Le await ici ne fonctionne pas et je ne sais pas pourquoi
      await ajouteNouvellesDepenses(depenses, id_activite);
    }

    const responseBody = await getActiviteAvecDepenses(id_activite);

    return responseBody;
  };

  // Appel de la fonction asynchrone principale et renvoie la réponse
  doModifierActiviteEtDepenses()
    .then((responseBody) => {
      response.status(200).json(responseBody);
    })
    .catch((e) => {
      console.log(chalk.red.bold(e));
      response.sendStatus(500);
    });
};

// ------ SUPPRIME UNE ACTIVITE ------ //
const deleteActivite = (request, response) => {
  const id_fiche_technique = request.params.id; // A utiliser plus tard pour vérifier les droits de l'utilisateur
  const id_activite = request.params.id_activite;
  dbConn.pool.query(
    `DELETE FROM fiche.activite WHERE id=$1 RETURNING *`,
    [id_activite],
    (err, res) => {
      if (err) {
        throw err;
      }
      if (res.rows[0] !== undefined) {
        response.status(200).send(res.rows[0]);
      } else {
        response.sendStatus(404);
      }
    }
  );
};

export { postActivite, putActivite, deleteActivite };
