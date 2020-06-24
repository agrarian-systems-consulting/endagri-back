"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("../../db/pool"));

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const postActivite = (request, response) => {
  const id_fiche_technique = request.params.id_fiche_technique;
  const {
    libelle_activite,
    mois,
    mois_relatif,
    depenses
  } = request.body;

  const promiseAjoutActivite = () => {
    return new Promise((resolve, reject) => {
      const postActiviteQuery = `INSERT INTO fiche.activite(id, id_fiche_technique, libelle, mois, mois_relatif) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *`;

      _pool.default.pool.query(postActiviteQuery, [id_fiche_technique, libelle_activite, mois, mois_relatif], (error, results) => {
        if (error) {
          return reject(error);
        }

        const id_activite = results.rows[0].id;
        resolve(id_activite);
      });
    });
  };

  const promiseDepense = (depense, id_activite) => {
    const {
      libelle_depense,
      montant
    } = depense;
    return new Promise((resolve, reject) => {
      const postDepenseQuery = `INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES (DEFAULT, $1, $2, $3) RETURNING *`;

      _pool.default.pool.query(postDepenseQuery, [id_activite, libelle_depense, montant], (error, results) => {
        if (error) {
          reject(error);
        }

        resolve('Dépense ajoutée', results.rows[0]);
      });
    });
  };

  const ajouterDepenses = async id_activite => {
    return Promise.all(depenses.map(depense => {
      return promiseDepense(depense, id_activite);
    }));
  };

  const getActiviteAvecDepenses = id_activite => {
    return new Promise((resolve, reject) => {
      const getActiviteAvecDepensesQuery = `SELECT a.*, json_agg(json_build_object('id', d.id,'libelle', d.libelle,'montant', d.montant)) depenses 
      FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id=$1 GROUP BY a.id`;

      _pool.default.pool.query(getActiviteAvecDepensesQuery, [id_activite], (error, results) => {
        if (error) {
          reject(error);
        }

        resolve(results.rows[0]);
      });
    });
  };

  const doAjouterActiviteEtDepenses = async () => {
    const id_activite = await promiseAjoutActivite();

    if (depenses != undefined) {
      await ajouterDepenses(id_activite);
    }

    const responseBody = await getActiviteAvecDepenses(id_activite);
    return responseBody;
  };

  doAjouterActiviteEtDepenses().then(result => {
    response.status(201).json(result);
  }).catch(e => console.log(_chalk.default.red.bold(e)));
};

const putActivite = (request, response) => {
  const id_fiche_technique = request.params.id_fiche_technique;
  const id_activite = request.params.id_activite;
  const {
    libelle_activite,
    mois_relatif,
    mois,
    depenses
  } = request.body;

  const updateActivite = () => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`UPDATE fiche.activite SET libelle=$1, mois_relatif=$2, mois=$3 WHERE id=$4 RETURNING *`, [libelle_activite, mois_relatif, mois, id_activite], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const deletePreviousDepenses = () => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`DELETE FROM fiche.depense WHERE id_activite=$1 RETURNING id`, [id_activite], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows);
      });
    });
  };

  const promiseInsertDepense = depense => {
    const {
      libelle_depense,
      montant
    } = depense;
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES (DEFAULT, $1, $2, $3) RETURNING *`, [id_activite, libelle_depense, montant], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const ajouteNouvellesDepenses = async depenses => {
    return Promise.all(depenses.map(depense => {
      return promiseInsertDepense(depense);
    }));
  };

  const getActiviteAvecDepenses = () => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`SELECT a.*, json_agg(json_build_object('id', d.id,'libelle', d.libelle,'montant', d.montant)) depenses 
        FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id=$1 GROUP BY a.id`, [id_activite], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const doModifierActiviteEtDepenses = async () => {
    await updateActivite(id_activite);
    await deletePreviousDepenses(id_activite);

    if (depenses !== undefined) {
      await ajouteNouvellesDepenses(depenses, id_activite);
    }

    const responseBody = await getActiviteAvecDepenses(id_activite);
    return responseBody;
  };

  doModifierActiviteEtDepenses().then(responseBody => {
    response.status(200).json(responseBody);
  }).catch(e => {
    console.log(_chalk.default.red.bold(e));
    response.sendStatus(500);
  });
};

const deleteActivite = (request, response) => {
  const id_fiche_technique = request.params.id;
  const id_activite = request.params.id_activite;

  _pool.default.pool.query(`DELETE FROM fiche.activite WHERE id=$1 RETURNING *`, [id_activite], (err, res) => {
    if (err) {
      throw err;
    }

    if (res.rows[0] !== undefined) {
      response.status(200).send(res.rows[0]);
    } else {
      response.sendStatus(404);
    }
  });
};

var _default = {
  postActivite,
  putActivite,
  deleteActivite
};
exports.default = _default;