"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("../../db/pool"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getProductions = (request, response) => {
  const {
    type_production
  } = request.query;

  if (type_production !== undefined) {
    _pool.default.pool.query('SELECT id,libelle,type_production FROM fiche.production WHERE type_production = $1 ORDER BY id ASC', [type_production], (err, res) => {
      if (err) {
        throw err;
      }

      response.status(200).send(res.rows);
    });
  } else {
    _pool.default.pool.query(`SELECT p.id,p.libelle, p.type_production, json_agg(json_build_object('libelle',x.libelle,'unite',x.unite)) produits
      FROM fiche.production p
      LEFT JOIN fiche.produit x 
      ON x.id_production = p.id
      GROUP BY p.id
      ORDER BY p.libelle ASC`, (err, res) => {
      if (err) {
        throw err;
      }

      response.status(200).send(res.rows);
    });
  }
};

const postProduction = (request, response) => {
  const {
    libelle_production,
    type_production,
    produits
  } = request.body;

  const ajouterProduction = (libelle_production, type_production) => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query('INSERT INTO fiche.production(id,libelle,type_production) VALUES (DEFAULT, $1,$2) RETURNING *', [libelle_production, type_production], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows[0].id);
      });
    });
  };

  const promiseInsertProduit = (id_production, {
    libelle_produit,
    unite
  }) => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query('INSERT INTO fiche.produit(id, id_production,libelle,unite) VALUES (DEFAULT, $1,$2, $3)', [id_production, libelle_produit, unite], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  };

  const ajouterProduits = async (id_production, produits) => {
    return Promise.all(produits.map(produit => {
      return promiseInsertProduit(id_production, produit);
    }));
  };

  const getProductionEtProduits = id_production => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`SELECT production.*,json_agg(json_build_object('id',produit.id,'libelle',produit.libelle,'unite',produit.unite)) produits FROM fiche.production AS production LEFT JOIN fiche.produit produit ON produit.id_production = production.id WHERE production.id=$1 GROUP BY production.id`, [id_production], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const doWork = async (libelle_production, type_production, produits) => {
    const id_production = await ajouterProduction(libelle_production, type_production);

    if (produits !== undefined) {
      await ajouterProduits(id_production, produits);
    }

    const responseBody = await getProductionEtProduits(id_production);
    return responseBody;
  };

  doWork(libelle_production, type_production, produits).then(responseBody => response.status(200).send(responseBody)).catch(e => {
    console.log(e);
    throw e;
  });
};

const getProductionById = (request, response) => {
  const id_production = request.params.id;
  const getProductionByIdQuery = `SELECT production.*, json_agg(json_build_object('id',produit.id,'libelle',produit.libelle,'unite',produit.libelle)) produits FROM fiche.production production LEFT JOIN fiche.produit produit ON produit.id_production = production.id WHERE production.id=$1 GROUP BY production.id`;

  _pool.default.pool.query(getProductionByIdQuery, [id_production], (error, results) => {
    if (error) {
      throw error;
    }

    response.status(200).send(results.rows[0]);
  });
};

const putProductionById = (request, response) => {
  const id_production = request.params.id;
  const {
    libelle_production,
    type_production,
    produits
  } = request.body;

  const supprimerAnciensProduits = id_production => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`DELETE FROM fiche.produit WHERE id_production=$1 RETURNING *`, [id_production], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows);
      });
    });
  };

  const modifierProduction = (libelle_production, type_production, id_production) => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query('UPDATE fiche.production SET libelle=$1, type_production=$2 WHERE id=$3 RETURNING *', [libelle_production, type_production, id_production], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const promiseInsertProduit = (id_production, {
    libelle_produit,
    unite
  }) => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query('INSERT INTO fiche.produit(id, id_production,libelle,unite) VALUES (DEFAULT, $1,$2, $3)', [id_production, libelle_produit, unite], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  };

  const ajouterProduits = async (id_production, produits) => {
    return Promise.all(produits.map(produit => {
      return promiseInsertProduit(id_production, produit);
    }));
  };

  const getProductionEtProduits = id_production => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`SELECT production.*,json_agg(json_build_object('id',produit.id,'libelle',produit.libelle,'unite',produit.unite)) produits FROM fiche.production AS production LEFT JOIN fiche.produit produit ON produit.id_production = production.id WHERE production.id=$1 GROUP BY production.id`, [id_production], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const doModifierProductionEtProduits = async (libelle_production, type_production, produits, id_production) => {
    await modifierProduction(libelle_production, type_production, id_production);
    await supprimerAnciensProduits(id_production);

    if (produits !== undefined) {
      await ajouterProduits(id_production, produits);
    }

    const responseBody = await getProductionEtProduits(id_production);
    return responseBody;
  };

  doModifierProductionEtProduits(libelle_production, type_production, produits, id_production).then(responseBody => response.status(200).send(responseBody)).catch(e => {
    console.log(e);
    throw e;
  });
};

const deleteProductionById = (request, response) => {
  const id_production = request.params.id;

  const supprimerProduction = id_production => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query('DELETE FROM fiche.production WHERE id=$1 RETURNING *', [id_production], (err, res) => {
        if (err) {
          reject(err);
        }

        if (res.rows[0] !== undefined) {
          resolve(res.rows[0].id);
        } else {
          reject();
        }
      });
    });
  };

  const supprimerProduits = id_production => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query('DELETE FROM fiche.produit WHERE id_production=$1 RETURNING *', [id_production], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  };

  const doWork = async id_production => {
    await supprimerProduction(id_production);
    await supprimerProduits(id_production);
    return;
  };

  doWork(id_production).then(() => {
    response.sendStatus(204);
  }).catch(e => {
    console.log(e);
    response.sendStatus(404);
  });
};

var _default = {
  getProductions,
  postProduction,
  getProductionById,
  putProductionById,
  deleteProductionById
};
exports.default = _default;