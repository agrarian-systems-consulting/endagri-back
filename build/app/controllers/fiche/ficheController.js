"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("../../db/pool"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getFiches = (request, response) => {
  const id_utilisateur = request.query.id_utilisateur;

  if (id_utilisateur !== undefined) {
    const getFichesQuery = 'SELECT f.id, f.id_production, f.id_utilisateur, f.libelle, p.libelle as libelle_production FROM fiche.fiche_technique f LEFT JOIN fiche.production p ON f.id_production = p.id  WHERE f.id_utilisateur=$1 ORDER BY f.id ASC';

    _pool.default.pool.query(getFichesQuery, [id_utilisateur], (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).send(results.rows);
    });
  } else {
    const getFichesQuery = `SELECT f.id, f.id_production, f.id_utilisateur, f.libelle, p.libelle as libelle_production FROM fiche.fiche_technique f 
    JOIN fiche.production p ON f.id_production = p.id ORDER BY f.id ASC`;

    _pool.default.pool.query(getFichesQuery, (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).send(results.rows);
    });
  }
};

const postFiche = (request, response) => {
  const {
    libelle,
    id_production,
    id_utilisateur,
    ini_debut,
    ini_fin,
    commentaire,
    ventes,
    activites
  } = request.body;

  _pool.default.pool.query(`INSERT INTO fiche.fiche_technique(id, id_utilisateur, libelle, id_production, ini_debut, ini_fin,commentaire) VALUES (DEFAULT, $1, $2, $3, $4, $5,$6) RETURNING id`, [id_utilisateur, libelle, id_production, ini_debut, ini_fin, commentaire], (err, res) => {
    if (err) {
      throw err;
    }

    const id_fiche_technique = res.rows[0].id;
    response.set('Content-Type', 'application/json').status(201).json({
      id: id_fiche_technique
    });
  });
};

const getFicheById = (request, response) => {
  const {
    id
  } = request.params;

  const promiseGetFiche = id => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(` SELECT 
            f.*,
            p.id id_production,
            p.libelle libelle_production,
            p.type_production type_production
          FROM 
            fiche.fiche_technique f 
          LEFT JOIN
            fiche.production p
            ON f.id_production = p.id
          WHERE f.id=$1
          GROUP BY f.id, p.id`, [id], (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const promiseActivitesAvecDepenses = id => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`SELECT a.*, json_agg(json_build_object('id', d.id,'libelle', d.libelle,'montant', d.montant)) depenses 
        FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id_fiche_technique=$1 GROUP BY a.id`, [id], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows);
      });
    });
  };

  const promiseGetDepenses = id => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`SELECT d.*, a.mois mois, a.mois_relatif mois_relatif
        FROM fiche.depense d LEFT JOIN fiche.activite a ON a.id = d.id_activite WHERE a.id_fiche_technique=$1 GROUP BY d.id,a.id ORDER BY a.mois_relatif ASC `, [id], (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        resolve(res.rows);
      });
    });
  };

  const promiseGetVentes = id => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(` SELECT 
            v.id,
            v.id_fiche_technique,
            v.mois,
            v.mois_relatif,
            v.rendement,
            v.rendement_min, 
            v.rendement_max,
            m.type_marche,
            m.localisation,
            m.id id_marche,
            p.libelle libelle_produit,
            p.unite unite
          FROM 
            fiche.vente v
          LEFT JOIN fiche.marche m  
            ON v.id_marche = m.id
          LEFT JOIN fiche.produit p  
            ON m.id_produit = p.id
          WHERE v.id_fiche_technique=$1
          GROUP BY v.id, m.id, p.id`, [id], (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        resolve(res.rows);
      });
    });
  };

  const getFicheComplete = async id => {
    const ficheBody = await promiseGetFiche(id);
    ficheBody.activites = await promiseActivitesAvecDepenses(id);
    ficheBody.ventes = await promiseGetVentes(id);
    ficheBody.depenses = await promiseGetDepenses(id);
    return ficheBody;
  };

  getFicheComplete(id).then(res => {
    response.status(200).json(res);
  }).catch(err => response.sendStatus(500));
};

const putFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const {
    libelle_fiche,
    ini_debut,
    ini_fin,
    commentaire
  } = request.body;
  const putFicheByIdQuery = `UPDATE fiche.fiche_technique SET libelle=$1, ini_debut=$2, ini_fin=$3, commentaire=$4 WHERE id=$5 RETURNING *`;

  _pool.default.pool.query(putFicheByIdQuery, [libelle_fiche, ini_debut, ini_fin, commentaire, id_fiche], (err, res) => {
    if (err) {
      console.log(err);
      throw err;
    }

    if (res.rows[0] !== undefined) {
      response.status(200).send(res.rows[0]);
    } else {
      response.sendStatus(404);
    }
  });
};

const deleteFicheById = (request, response) => {
  const id_fiche = request.params.id;

  const promiseDeleteFiche = id_fiche => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query('DELETE FROM fiche.fiche_technique WHERE id=$1 RETURNING *', [id_fiche], (err, res) => {
        if (err) {
          reject(err);
        }

        if (res.rows[0] !== undefined) {
          resolve(res.rows[0]);
        } else {
          reject("La fiche n'existe pas");
        }
      });
    });
  };

  const promiseDeleteAllActivites = id_fiche => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`DELETE FROM fiche.activite WHERE id_fiche_technique=$1 RETURNING *`, [id_fiche], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  };

  const promiseDeleteAllVentes = id_fiche => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`DELETE FROM fiche.vente WHERE id_fiche_technique=$1 RETURNING *`, [id_fiche], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  };

  const doWork = async id_fiche => {
    await promiseDeleteAllVentes(id_fiche);
    await promiseDeleteAllActivites(id_fiche);
    const responseBody = await promiseDeleteFiche(id_fiche);
    return responseBody;
  };

  doWork(id_fiche).then(res => {
    response.status(200).json(res);
  }).catch(err => {
    console.log(err);
    response.sendStatus(500);
  });
};

var _default = {
  getFiches,
  postFiche,
  getFicheById,
  putFicheById,
  deleteFicheById
};
exports.default = _default;