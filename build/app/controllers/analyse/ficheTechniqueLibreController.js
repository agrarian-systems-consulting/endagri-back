"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("../../db/pool"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const postFicheTechniqueLibre = (request, response) => {
  const id_analyse = request.params.id;
  const {
    id_fiche_technique,
    date_ini,
    coeff_surface_ou_nombre_animaux,
    coeff_main_oeuvre_familiale,
    coeff_ventes,
    coeff_depenses
  } = request.body;

  const promiseAjoutFicheTechniqueLibre = () => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`
      INSERT INTO 
      analyse_fiche.fiche_technique_libre(
        id, 
        id_fiche_technique,
        date_ini, 
        coeff_surface_ou_nombre_animaux, 
        coeff_main_oeuvre_familiale, 
        id_analyse)
      VALUES (
        DEFAULT, $1, $2, $3, $4,$5
        ) 
      RETURNING *`, [id_fiche_technique, date_ini, coeff_surface_ou_nombre_animaux, coeff_main_oeuvre_familiale, id_analyse], (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const promiseCoeffVente = (coeff_vente, id_fiche_technique_libre) => {
    const {
      libelle_categorie,
      coeff_autoconsommation,
      coeff_intraconsommation,
      coeff_rendement
    } = coeff_vente;
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`INSERT INTO 
        analyse_fiche.coeff_vente(
          id, 
          id_fiche_technique_libre,
          libelle_categorie,
          coeff_autoconsommation,
          coeff_intraconsommation,
          coeff_rendement) 
        VALUES (
          DEFAULT, $1, $2, $3, $4, $5
          ) 
        RETURNING *`, [id_fiche_technique_libre, libelle_categorie, coeff_autoconsommation, coeff_intraconsommation, coeff_rendement], (error, results) => {
        if (error) {
          reject(error);
        }

        resolve(results.rows[0]);
      });
    });
  };

  const ajouterCoeffVentes = async id_fiche_technique_libre => {
    return Promise.all(coeff_ventes.map(async coeff_vente => await promiseCoeffVente(coeff_vente, id_fiche_technique_libre)));
  };

  const promiseCoeffDepense = (coeff_depense, id_fiche_technique_libre) => {
    const {
      libelle_categorie,
      coeff_intraconsommation
    } = coeff_depense;
    return new Promise((resolve, reject) => {
      const postCoeffDepenseQuery = `INSERT INTO analyse_fiche.coeff_depense(id, id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation) 
      VALUES (DEFAULT, $1, $2, $3) RETURNING *`;

      _pool.default.pool.query(postCoeffDepenseQuery, [libelle_categorie, coeff_intraconsommation], (error, results) => {
        if (error) {
          reject(error);
        }

        resolve('Coeff Dépense ajoutée', results.rows[0]);
      });
    });
  };

  const ajouterCoeffDepenses = async id_fiche_technique_libre => {
    return Promise.all(coeff_depenses.map(coeff_depense => promiseCoeffDepense(coeff_depense, id_fiche_technique_libre)));
  };

  const promiseGetFicheComplete = id_fiche_technique_libre => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(` SELECT 
        f.*,
        ft.libelle libelle_fiche_technique,
        p.libelle libelle_production,
        p.type_production type_production,
        json_agg(
          json_build_object(
            'id', d.id,
            'libelle_categorie', d.libelle_categorie,
            'coeff_intraconsommation', d.coeff_intraconsommation
          )
        ) coeff_depenses
        ,
        json_agg(
          json_build_object(
            'id', v.id,
            'libelle_categorie', v.libelle_categorie,
            'coeff_intraconsommation', v.coeff_intraconsommation
          )
        ) coeff_ventes
       
      FROM 
        analyse_fiche.fiche_technique_libre f
      LEFT JOIN analyse_fiche.coeff_depense d
        ON f.id = d.id_fiche_technique_libre
      LEFT JOIN analyse_fiche.coeff_vente as v
        ON f.id = v.id_fiche_technique_libre
      LEFT JOIN fiche.fiche_technique ft
        ON ft.id = f.id_fiche_technique::integer
      LEFT JOIN fiche.production p
        ON ft.id_production::integer = p.id
      WHERE 
        f.id=$1
      GROUP BY 
        f.id, ft.id, p.id`, [id_fiche_technique_libre], (error, results) => {
        if (error) {
          reject(error);
        }

        resolve(results.rows[0]);
      });
    });
  };

  const doWork = async () => {
    const fiche_technique_libre = await promiseAjoutFicheTechniqueLibre();
    const ficheComplete = await promiseGetFicheComplete(fiche_technique_libre.id);
    return ficheComplete;
  };

  doWork().then(result => {
    response.status(200).json(result);
  }).catch(e => console.log(chalk.red.bold(e)));
};

const getFicheTechniqueLibre = (request, response) => {
  const {
    id_ftl
  } = request.params;

  const promiseGetFicheComplete = id_ftl => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(` SELECT 
        f.*,
        ft.libelle libelle_fiche_technique,
        p.libelle libelle_production,
        p.type_production type_production,
        json_agg(
          json_build_object(
            'id', d.id,
            'libelle_categorie', d.libelle_categorie,
            'coeff_intraconsommation', d.coeff_intraconsommation
          )
        ) coeff_depenses
        ,
        json_agg(
          json_build_object(
            'id', v.id,
            'libelle_categorie', v.libelle_categorie,
            'coeff_intraconsommation', v.coeff_intraconsommation
          )
        ) coeff_ventes
       
      FROM 
        analyse_fiche.fiche_technique_libre f
      LEFT JOIN analyse_fiche.coeff_depense d
        ON f.id = d.id_fiche_technique_libre
      LEFT JOIN analyse_fiche.coeff_vente as v
        ON f.id = v.id_fiche_technique_libre
      LEFT JOIN fiche.fiche_technique ft
        ON ft.id = f.id_fiche_technique::integer
      LEFT JOIN fiche.production p
        ON ft.id_production::integer = p.id
      WHERE 
        f.id=$1
      GROUP BY 
        f.id, ft.id, p.id`, [id_ftl], (err, res) => {
        if (err) {
          console.log(err);
          reject(error);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const doWork = async id_ftl => {
    let ficheComplete = await promiseGetFicheComplete(id_ftl);
    ficheComplete.coeff_depenses = ficheComplete.coeff_depenses.filter(c => c.id !== null);
    ficheComplete.coeff_ventes = ficheComplete.coeff_ventes.filter(c => c.id !== null);
    return ficheComplete;
  };

  doWork(id_ftl).then(res => {
    response.status(200).json(res);
  }).catch(err => {
    console.log(err);
    response.sendStatus(500);
  });
};

const deleteFicheTechniqueLibre = (request, response) => {
  const id = request.params.id;

  const promiseDeleteFicheTechniqueLibre = id => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`
      DELETE FROM
      analyse_fiche.fiche_technique_libre WHERE id=$1 RETURNING *`, [id], (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const promiseDeleteCoeffVente = id_fiche_technique_libre => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`DELETE FROM
        analyse_fiche.coeff_vente WHERE id_fiche_technique_libre=$1
        RETURNING *`, [id_fiche_technique_libre], (error, results) => {
        if (error) {
          reject(error);
        }

        resolve(results.rows[0]);
      });
    });
  };

  const promiseDeleteCoeffDepense = id_fiche_technique_libre => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`DELETE FROM
        analyse_fiche.coeff_depense WHERE id_fiche_technique_libre=$1
        RETURNING *`, [id_fiche_technique_libre], (error, results) => {
        if (error) {
          reject(error);
        }

        resolve(results.rows[0]);
      });
    });
  };

  const doWork = async id => {
    await promiseDeleteFicheTechniqueLibre(id);
    await promiseDeleteCoeffDepense(id);
    await promiseDeleteCoeffVente(id);
    return;
  };

  doWork(id).then(res => {
    response.sendStatus(200);
  }).catch(err => {
    console.log(err);
    response.sendStatus(500);
  });
};

const postCoeffDepense = (request, response) => {
  const {
    id_fiche_technique_libre,
    libelle_categorie,
    coeff_intraconsommation
  } = request.body;

  const promisePostCoeffDepense = (id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation) => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`INSERT INTO analyse_fiche.coeff_depense(
          id,
          id_fiche_technique_libre,
          libelle_categorie,
          coeff_intraconsommation
          )
        VALUES (DEFAULT, $1, $2, $3)
        RETURNING *`, [id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation], (err, res) => {
        if (err) {
          console.log(err);
          reject(error);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const doWork = async (id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation) => {
    let coeff_depense = await promisePostCoeffDepense(id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation);
    return coeff_depense;
  };

  doWork(id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation).then(res => {
    response.status(200).json(res);
  }).catch(err => {
    console.log(err);
    response.sendStatus(500);
  });
};

const deleteCoeffDepense = (request, response) => {
  const {
    id
  } = request.params;

  const promiseDeleteCoeffDepense = id => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`DELETE FROM analyse_fiche.coeff_depense WHERE id=$1 RETURNING *`, [id], (err, res) => {
        if (err) {
          console.log(err);
          reject(error);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const doWork = async id => {
    await promiseDeleteCoeffDepense(id);
    return;
  };

  doWork(id).then(res => {
    response.sendStatus(200);
  }).catch(err => {
    console.log(err);
    response.sendStatus(500);
  });
};

const postCoeffVente = (request, response) => {
  const {
    id_fiche_technique_libre,
    libelle_categorie,
    coeff_intraconsommation,
    coeff_autoconsommation,
    coeff_rendement
  } = request.body;

  const promisePostCoeffDepense = (id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation, coeff_autoconsommation, coeff_rendement) => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`INSERT INTO analyse_fiche.coeff_depense(
          id,
          id_fiche_technique_libre,
          libelle_categorie,
          coeff_intraconsommation,
          coeff_autoconsommation,
          coeff_rendement
          )
        VALUES (DEFAULT, $1, $2, $3)
        RETURNING *`, [id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation, coeff_autoconsommation, coeff_rendement], (err, res) => {
        if (err) {
          console.log(err);
          reject(error);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const doWork = async (id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation, coeff_autoconsommation, coeff_rendement) => {
    let coeff_depense = await promisePostCoeffDepense(id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation, coeff_autoconsommation, coeff_rendement);
    return coeff_depense;
  };

  doWork(id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation, coeff_autoconsommation, coeff_rendement).then(res => {
    response.status(200).json(res);
  }).catch(err => {
    console.log(err);
    response.sendStatus(500);
  });
};

const deleteCoeffVente = (request, response) => {
  const {
    id
  } = request.params;

  const promiseDeleteCoeffVente = id => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`DELETE FROM analyse_fiche.coeff_vente WHERE id=$1 RETURNING *`, [id], (err, res) => {
        if (err) {
          console.log(err);
          reject(error);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const doWork = async id => {
    await promiseDeleteCoeffVente(id);
    return;
  };

  doWork(id).then(res => {
    response.sendStatus(200);
  }).catch(err => {
    console.log(err);
    response.sendStatus(500);
  });
};

var _default = {
  postFicheTechniqueLibre,
  getFicheTechniqueLibre,
  deleteFicheTechniqueLibre,
  postCoeffDepense,
  deleteCoeffDepense,
  postCoeffVente,
  deleteCoeffVente
};
exports.default = _default;