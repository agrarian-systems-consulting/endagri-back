import dbConn from '../../db/pool';
import _, { filter } from 'lodash';
// ---- LISTER TOUTES LES PRODUCTIONS ---- //
const getProductions = (request, response) => {
  const { type_production } = request.query;

  if (type_production !== undefined) {
    dbConn.pool.query(
      'SELECT id,libelle,type_production FROM fiche.production WHERE type_production = $1 ORDER BY id ASC',
      [type_production],
      (err, res) => {
        if (err) {
          console.error(err);
          response.sendStatus(500);
        }
        response.status(200).send(res.rows);
      }
    );
  } else {
    dbConn.pool.query(
      `SELECT p.id,p.libelle, p.type_production, json_agg(json_build_object('libelle',x.libelle,'unite',x.unite,'id',x.id)) produits
      FROM fiche.production p
      LEFT JOIN fiche.produit x 
      ON x.id_production = p.id
      GROUP BY p.id
      ORDER BY p.libelle ASC`,
      (err, res) => {
        if (err) {
          console.error(err);
          response.sendStatus(500);
        }
        response.status(200).send(res.rows);
      }
    );
  }
};

// --- CREER UNE PRODUCTION --- //
const postProduction = (request, response) => {
  const { libelle, type_production } = request.body;

  const ajouterProduction = (libelle, type_production) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'INSERT INTO fiche.production(id,libelle,type_production) VALUES (DEFAULT, $1,$2) RETURNING *',
        [libelle, type_production],
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

  ajouterProduction(libelle, type_production)
    .then((res) => response.status(200).json(res))
    .catch((e) => {
      console.error(e);
      response.sendStatus(500);
    });
};

// --- CREER UNE PRODUCTION ET SES PRODUITS ASSOCIES --- //
const postProductionWithProduits = (request, response) => {
  const { libelle_production, type_production, produits } = request.body;

  const ajouterProduction = (libelle_production, type_production) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'INSERT INTO fiche.production(id,libelle,type_production) VALUES (DEFAULT, $1,$2) RETURNING *',
        [libelle_production, type_production],
        (err, res) => {
          if (err) {
            console.error(err);
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
            console.error(err);
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
        `SELECT production.*,json_agg(json_build_object('id',produit.id,'libelle',produit.libelle,'unite',produit.unite)) produits FROM fiche.production AS production LEFT JOIN fiche.produit produit ON produit.id_production = production.id WHERE production.id=$1 GROUP BY production.id`,
        [id_production],
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

  const doWork = async (libelle_production, type_production, produits) => {
    const id_production = await ajouterProduction(
      libelle_production,
      type_production
    );
    if (produits !== undefined) {
      await ajouterProduits(id_production, produits);
    }
    const responseBody = await getProductionEtProduits(id_production);
    return responseBody;
  };

  doWork(libelle_production, type_production, produits)
    .then((responseBody) => response.status(200).send(responseBody))
    .catch((e) => {
      console.error(e);
      response.sendStatus(500);
    });
};

// ---- RECUPERER UNE PRODUCTION ET SES PRODUITS --- //
const getProductionById = (request, response) => {
  const id_production = request.params.id;
  const getProductionByIdQuery = `
  SELECT 
    production.*, 
    json_agg(json_build_object('id',produit.id,'libelle',produit.libelle,'unite',produit.unite)) produits 
  FROM fiche.production production 
  LEFT JOIN fiche.produit produit 
    ON produit.id_production = production.id 
  WHERE production.id=$1 
  GROUP BY production.id`;
  dbConn.pool.query(
    getProductionByIdQuery,
    [id_production],
    (error, results) => {
      if (error) {
        console.error(error);
        response.sendStatus(500);
      }
      // Si aucune production n'est trouvée n'est trouvé
      if (results.rows[0] === undefined) {
        return response.sendStatus(404);
      }
      // Filter les valeurs nulles (problème qui vient de json_agg)
      let product = results.rows[0];
      const produits = product.produits;
      const filteredProducts = produits.filter((p) => p.id !== null);
      product.produits = filteredProducts;
      response.status(200).send(product);
    }
  );
};

// ---- RECUPERER LES PRODUITS D'UNE PRODUCTION --- //
const getProduitsByProductionId = (request, response) => {
  const id_production = request.params.id;

  const getProduitsByProductionIdQuery = `
  SELECT 
    id, libelle, unite
  FROM fiche.produit
  WHERE id_production=$1`;
  dbConn.pool.query(
    getProduitsByProductionIdQuery,
    [id_production],
    (error, results) => {
      if (error) {
        console.error(error);
        response.sendStatus(500);
      }
      response.status(200).send(results.rows);
    }
  );
};

// ---- RECUPERER TOUS LES PRODUITS --- //
const getProduits = (request, response) => {
  const getProduitsQuery = `
  SELECT 
    id, libelle, unite
  FROM fiche.produit
`;
  dbConn.pool.query(getProduitsQuery, (error, results) => {
    if (error) {
      console.error(error);
      response.sendStatus(500);
    }
    response.status(200).send(results.rows);
  });
};

// ---- MODIFIER UNE PRODUCTION ET SES PRODUITS --- //
const putProductionById = (request, response) => {
  const id_production = request.params.id;
  const { libelle_production, type_production, produits } = request.body;

  const supprimerAnciensProduits = (id_production) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `DELETE FROM fiche.produit WHERE id_production=$1 RETURNING *`,
        [id_production],
        (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(res.rows);
        }
      );
    });
  };

  const modifierProduction = (
    libelle_production,
    type_production,
    id_production
  ) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'UPDATE fiche.production SET libelle=$1, type_production=$2 WHERE id=$3 RETURNING *',
        [libelle_production, type_production, id_production],
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

  const promiseInsertProduit = (id_production, { libelle_produit, unite }) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'INSERT INTO fiche.produit(id, id_production,libelle,unite) VALUES (DEFAULT, $1,$2, $3)',
        [id_production, libelle_produit, unite],
        (err, res) => {
          if (err) {
            console.error(err);
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
        `SELECT production.*,json_agg(json_build_object('id',produit.id,'libelle',produit.libelle,'unite',produit.unite)) produits FROM fiche.production AS production LEFT JOIN fiche.produit produit ON produit.id_production = production.id WHERE production.id=$1 GROUP BY production.id`,
        [id_production],
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

  const doModifierProductionEtProduits = async (
    libelle_production,
    type_production,
    produits,
    id_production
  ) => {
    await modifierProduction(
      libelle_production,
      type_production,
      id_production
    );

    await supprimerAnciensProduits(id_production);

    if (produits !== undefined) {
      await ajouterProduits(id_production, produits);
    }
    const responseBody = await getProductionEtProduits(id_production);
    return responseBody;
  };

  doModifierProductionEtProduits(
    libelle_production,
    type_production,
    produits,
    id_production
  )
    .then((responseBody) => response.status(200).send(responseBody))
    .catch((e) => {
      console.error(e);
      response.sendStatus(500);
    });
};

// ---- SUPPRIMER UNE PRODUCTION ET SES PRODUITS --- //
const deleteProductionById = (request, response) => {
  const id_production = request.params.id;

  const supprimerProduction = (id_production) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'DELETE FROM fiche.production WHERE id=$1 RETURNING *',
        [id_production],
        (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          }

          if (res.rows[0] !== undefined) {
            resolve(res.rows[0].id);
          } else {
            reject();
          }
        }
      );
    });
  };

  const supprimerProduits = (id_production) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'DELETE FROM fiche.produit WHERE id_production=$1 RETURNING *',
        [id_production],
        (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve();
        }
      );
    });
  };

  const doWork = async (id_production) => {
    await supprimerProduction(id_production);
    await supprimerProduits(id_production);
    return;
  };

  doWork(id_production)
    .then(() => {
      response.sendStatus(204);
    })
    .catch((e) => {
      console.error(e);
      response.sendStatus(500);
    });
};

// --- CREER UN PRODUIT ASSOCIE A UNE PRODUCTION EXISTANTE
const addProductToProduction = (request, response) => {
  const { libelle, unite, id_production } = request.body;

  const promiseAjouterProduit = (libelle, unite, id_production) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'INSERT INTO fiche.produit(id,libelle,unite,id_production) VALUES (DEFAULT, $1, $2, $3) RETURNING id',
        [libelle, unite, id_production],
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

  promiseAjouterProduit(libelle, unite, id_production)
    .then((res) => {
      response.status(200).json(res);
    })
    .catch((err) => {
      console.error(err);
      response.sendStatus(500);
    });
};

// --- SUPPRIMER UN PRODUIT EXISTANT --- //
const deleteProduct = (request, response) => {
  const { id } = request.params;

  const promiseDeleteProduit = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        'DELETE FROM fiche.produit WHERE id=$1 RETURNING *',
        [id],
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

  promiseDeleteProduit(id)
    .then((res) => {
      response.sendStatus(204);
    })
    .catch((err) => {
      console.error(err);
      response.sendStatus(404);
    });
};

export default {
  getProductions,
  postProduction,
  postProductionWithProduits,
  getProductionById,
  getProduitsByProductionId,
  getProduits,
  putProductionById,
  deleteProductionById,
  addProductToProduction,
  deleteProduct,
};
