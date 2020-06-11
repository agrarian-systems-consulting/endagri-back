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
        throw err;
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
        throw err;
      }
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
        throw err;
      }
      response.status(200).send(res.rows[0]);
    }
  );
};

export default {
  getAllDepensesLibres,
  postDepenseLibre,
  getDepenseLibreById,
};
