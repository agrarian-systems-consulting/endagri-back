import dbConn from '../../db/pool';

// ---- LISTER TOUTES LES PRODUCTIONS ---- //
// Ajouter le param optionnel
const getProductions = (request, response) => {
  const { type_production } = request.query;

  if (type_production !== undefined) {
    dbConn.pool.query(
      'SELECT id,libelle,type_production FROM fiche.production WHERE type_production = $1 ORDER BY id ASC',
      [type_production],
      (err, res) => {
        if (err) {
          throw err;
        }
        response.status(200).send(res.rows);
      }
    );
  } else {
    dbConn.pool.query(
      'SELECT id,libelle,type_production FROM fiche.production ORDER BY id ASC',
      (err, res) => {
        if (err) {
          throw err;
        }
        response.status(200).send(res.rows);
      }
    );
  }
};

// --- CREER UNE PRODUCTION ET SES PRODUITS ASSOCIES --- //
// Problème : Ne semble pas attendre la fin de Promise.all
const postProduction = (request, response) => {
  const { libelle_production, type_production, produits } = request.body;

  const ajouterProduction = (libelle_production, type_production) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'INSERT INTO fiche.production(id,libelle,type_production) VALUES (DEFAULT, $1,$2) RETURNING *',
        [libelle_production, type_production],
        (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res.rows[0].id);
        }
      );
    });
  };

  const promiseInsertProduit = (id_production, { libelle_produit, unite }) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'INSERT INTO fiche.produit(id, id_production,libelle,unite) VALUES (DEFAULT, $1,$2, $3)',
        [id_production, libelle_produit, unite],
        (err, res) => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  };

  const ajouterProduits = async (id_production, produits) => {
    return Promise.all(
      produits.map((produit) => {
        return promiseInsertProduit(id_production, produit);
      })
    );
  };

  const getProductionEtProduits = (id_production) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'SELECT production.*,json_agg(produit.*) FROM fiche.production AS production LEFT JOIN fiche.produit produit ON produit.id_production = production.id WHERE production.id=$1 GROUP BY production.id',
        [id_production],
        (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  const doWork = async (libelle_production, type_production, produits) => {
    const id_production = await ajouterProduction(
      libelle_production,
      type_production
    );
    await ajouterProduits(id_production, produits);
    const responseBody = await getProductionEtProduits(id_production);
    return responseBody;
  };

  doWork(libelle_production, type_production, produits)
    .then((responseBody) => response.status(200).send(responseBody))
    .catch((e) => {
      console.log(e);
      throw e;
    });
};

// CREER VUE
const getProductionById = (request, response) => {
  const id_production = request.params.id;
  const getProductionByIdQuery =
    'SELECT id,libelle,type_production FROM fiche.production WHERE id=$1';
  dbConn.pool.query(
    getProductionByIdQuery,
    [id_production],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(results.rows);
    }
  );
};

// A DISCUTER
const putProductionById = (request, response) => {
  const id_production = request.params.id;
  const { libelle_production, type_production } = request.body;
  const putProductionQuery =
    'UPDATE fiche.production SET libelle=$1, type_production=$2 WHERE id=$3';
  dbConn.pool.query(
    putProductionQuery,
    [libelle_production, type_production, id_production],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Update`);
    }
  );
};

// DONE
const deleteProductionById = (request, response) => {
  const id_production = request.params.id;
  const deleteProductionByIdQuery = 'DELETE FROM fiche.production WHERE id=$1';
  dbConn.pool.query(
    deleteProductionByIdQuery,
    [id_production],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Delete`);
    }
  );
};

export {
  getProductions,
  postProduction,
  getProductionById,
  putProductionById,
  deleteProductionById,
};
