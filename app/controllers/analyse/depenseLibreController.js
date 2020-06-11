import dbConn from '../../db/pool';

// ---- LISTER LES DEPENSES LIBRES D'UNE ANALYSE
const getAllDepensesLibres = (request, response) => {
  const id_analyse = request.params.id;

  dbConn.pool.query(
    `SELECT id, libelle, mois_reel, montant FROM analyse_fiche.depense_libre WHERE id_analyse=$1 ORDER BY id ASC`,
    [id_analyse],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(results.rows);
    }
  );
};

export default {
  getAllDepensesLibres,
};
