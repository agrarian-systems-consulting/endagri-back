import dbConn from '../../db/pool';
import chalk from 'chalk';
// ---- LISTER LES DEPENSES LIBRES D'UNE ANALYSE --- //
const getAllDepensesLibres = (request, response) => {
  const id_analyse = request.params.id;

  dbConn.pool.query(
    `SELECT id, libelle, mois_reel, montant FROM analyse_fiche.depense_libre WHERE id_analyse=$1 ORDER BY id ASC`,
    [id_analyse],
    (err, res) => {
      if (err) {
        console.error(err);
        response.sendStatus(500);
      }
      response.status(200).send(res.rows);
    }
  );
};

// ---- CREER UNE DEPENSE LIBRE --- //
const postDepenseLibre = (request, response) => {
  const id_analyse = request.params.id;
  const { libelle, mois_reel, montant } = request.body;

  dbConn.pool.query(
    `INSERT INTO analyse_fiche.depense_libre(id, id_analyse, libelle, mois_reel, montant) VALUES (DEFAULT, $1,$2,$3,$4) RETURNING id, id_analyse::integer, libelle, mois_reel, montant::integer`,
    [id_analyse, libelle, mois_reel, montant],
    (err, res) => {
      if (err) {
        console.error(err);
        response.sendStatus(500);
      }
      // console.log(res.rows[0]);
      response.status(200).send(res.rows[0]);
    }
  );
};

// ---- RECUPERER UNE DEPENSE LIBRE ---- //
const getDepenseLibreById = (request, response) => {
  const id_depense_libre = request.params.id_depense_libre;

  dbConn.pool.query(
    `SELECT id, id_analyse::integer, libelle, mois_reel, montant::integer FROM analyse_fiche.depense_libre
    WHERE id=$1
    ORDER BY id ASC`,
    [id_depense_libre],
    (err, res) => {
      if (err) {
        console.error(err);
        response.sendStatus(500);
      }
      response.status(200).send(res.rows[0]);
    }
  );
};

// ---- SUPPRIMER UNE DEPENSE LIBRE ---- //
const deleteDepenseLibre = (request, response) => {
  const { id_depense_libre } = request.params;

  const promiseDeleteDepenseLibre = (id_depense_libre) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `DELETE FROM analyse_fiche.depense_libre WHERE id=$1 RETURNING *`,
        [id_depense_libre],
        (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async (id_depense_libre) => {
    await promiseDeleteDepenseLibre(id_depense_libre);
    return;
  };

  // Appel de la fonction asynchrone principale
  doWork(id_depense_libre)
    .then((res) => {
      response.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
};

export default {
  getAllDepensesLibres,
  postDepenseLibre,
  getDepenseLibreById,
  deleteDepenseLibre,
};
