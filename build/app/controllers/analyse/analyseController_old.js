"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("../../db/pool"));

var _eachMonthOfInterval = _interopRequireDefault(require("date-fns/eachMonthOfInterval"));

var _dateFns = require("date-fns");

var _isWithinInterval = _interopRequireDefault(require("date-fns/isWithinInterval"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _ = require('lodash');

const getAnalyses = (request, response) => {
  const getAnalysesQuery = `SELECT * FROM analyse_fiche.analyse ORDER BY id ASC`;

  _pool.default.pool.query(getAnalysesQuery, (error, results) => {
    if (error) {
      throw error;
    }

    response.status(200).send(results.rows);
  });
};

const postAnalyse = (request, response) => {
  const {
    nom_utilisateur,
    nom_client,
    montant_tresorerie_initiale,
    date_debut_analyse,
    date_fin_analyse
  } = request.body;

  _pool.default.pool.query(`INSERT INTO analyse_fiche.analyse(
      id,
      nom_utilisateur,
      nom_client,
      montant_tresorerie_initiale,
      date_debut_analyse,
      date_fin_analyse) 
      VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING *`, [nom_utilisateur, nom_client, montant_tresorerie_initiale, date_debut_analyse, date_fin_analyse], (error, results) => {
    if (error) {
      throw error;
    }

    response.status(200).send(results.rows[0]);
  });
};

const getAnalyseById = (request, response) => {
  const id_analyse = request.params.id;
  const getInfoAnalyse = `SELECT a.id,a.nom_utilisateur,a.nom_client,a.montant_tresorerie_initiale,a.date_debut_analyse,a.date_fin_analyse
  FROM analyse_fiche.analyse a WHERE a.id=$1`;

  _pool.default.pool.query(getInfoAnalyse, [id_analyse], (error, results) => {
    if (error) {
      throw error;
    }

    const infoAnalyse = results.rows;
    const getInfoFTL = `SELECT ftl.id id_ftl,ftl.id_fiche_technique::integer,ftl.date_ini,ftl.coeff_surface_ou_nombre_animaux::integer,ftl.coeff_main_oeuvre_familiale::integer,
    (SELECT json_agg(json_build_object('libelle_categorie',cfv.libelle_categorie,'coeff_autoconsommation',cfv.coeff_autoconsommation,
    'coeff_intraconsommation',cfv.coeff_intraconsommation,'coeff_rendement',cfv.coeff_rendement)) coeff_ventes FROM analyse_fiche.coeff_vente cfv 
      WHERE cfv.id_fiche_technique_libre=ftl.id) coeff_ventes, 
        (SELECT json_agg(json_build_object('libelle_categorie',cfd.libelle_categorie,'coeff_intraconsommation',cfd.coeff_intraconsommation)) coeff_depenses 
        FROM analyse_fiche.coeff_depense cfd WHERE cfd.id_fiche_technique_libre=ftl.id) coeff_depenses
    FROM analyse_fiche.fiche_technique_libre ftl WHERE ftl.id_analyse=$1 ORDER BY ftl.id`;

    _pool.default.pool.query(getInfoFTL, [id_analyse], (error, results) => {
      if (error) {
        throw error;
      }

      const infoFTL = results.rows;

      let resultjson = _.extend({}, infoAnalyse, {
        fiches_techniques_libres: [infoFTL]
      });

      response.status(200).send(resultjson);
    });
  });
};

const putAnalyseById = (request, response) => {
  const id_analyse = request.params.id;
  const {
    nom_utilisateur,
    nom_client,
    montant_tresorerie_initiale,
    date_debut_analyse,
    date_fin_analyse
  } = request.body;

  _pool.default.pool.query(`UPDATE analyse_fiche.analyse SET
      nom_utilisateur = $2,
      nom_client = $3,
      montant_tresorerie_initiale = $4,
      date_debut_analyse = $5,
      date_fin_analyse = $6 
      WHERE id=$1 RETURNING *`, [id_analyse, nom_utilisateur, nom_client, montant_tresorerie_initiale, date_debut_analyse, date_fin_analyse], (error, results) => {
    if (error) {
      throw error;
    }

    response.status(200).send(results.rows[0]);
  });
};

const deleteAnalyseById = (request, response) => {
  const id_analyse = request.params.id;

  _pool.default.pool.query(`DELETE FROM analyse_fiche.analyse 
      WHERE id=$1 RETURNING *`, [id_analyse], (err, res) => {
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

const getAnalyseFluxFichesLibresById = async (request, response) => {
  const id_analyse = request.params.id;

  const getAnalyse = id_analyse => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`SELECT a.id,a.nom_utilisateur,a.nom_client,a.montant_tresorerie_initiale,a.date_debut_analyse,a.date_fin_analyse
  FROM analyse_fiche.analyse a WHERE a.id=$1`, [id_analyse], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const getFichesTechniquesLibres = id_analyse => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(`SELECT ftl.id id_ftl,ftl.id_fiche_technique::integer,ftl.date_ini,ftl.coeff_surface_ou_nombre_animaux::integer,ftl.coeff_main_oeuvre_familiale::integer,
        (SELECT json_agg(json_build_object('libelle_categorie',cfv.libelle_categorie,'coeff_autoconsommation',cfv.coeff_autoconsommation,
        'coeff_intraconsommation',cfv.coeff_intraconsommation,'coeff_rendement',cfv.coeff_rendement)) coeff_ventes FROM analyse_fiche.coeff_vente cfv 
          WHERE cfv.id_fiche_technique_libre=ftl.id) coeff_ventes, 
            (SELECT json_agg(json_build_object('libelle_categorie',cfd.libelle_categorie,'coeff_intraconsommation',cfd.coeff_intraconsommation)) coeff_depenses 
            FROM analyse_fiche.coeff_depense cfd WHERE cfd.id_fiche_technique_libre=ftl.id) coeff_depenses
        FROM analyse_fiche.fiche_technique_libre ftl WHERE ftl.id_analyse=$1 ORDER BY ftl.id`, [id_analyse], (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res.rows);
      });
    });
  };

  const promiseGetDepensesMoisReelsFicheTechnique = (id_fiche, date_ini_formatted) => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(` SELECT 
            CASE
              WHEN act.mois IS NOT NULL 
                THEN to_date(CONCAT(to_char($2::timestamp,'YYYY'), '-', act.mois), 'YYYY-MM')
                ELSE $2::timestamp + interval '1 month' * act.mois_relatif::integer
              END as mois_reel,
            d.id,
            d.id_activite::integer,
            d.libelle,
            d.montant,
            act.id_fiche_technique::integer as id_fiche_technique
          FROM fiche.depense d 
            JOIN fiche.activite act ON act.id=d.id_activite 
          WHERE act.id_fiche_technique=$1 
          GROUP BY act.mois, act.mois_relatif, act.id_fiche_technique, d.id
          `, [id_fiche, date_ini_formatted], (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        resolve(res.rows);
      });
    });
  };

  const getDepensesMoisReelsFichesTechniques = async fiches_techniques_libres => {
    return Promise.all(fiches_techniques_libres.map(ftl => {
      return promiseGetDepensesMoisReelsFicheTechnique(ftl.id_fiche_technique, (0, _dateFns.format)(ftl.date_ini, 'yyyy-MM-dd'));
    }));
  };

  const doWork = async () => {
    const analyse = await getAnalyse(id_analyse);
    const arrayMoisReels = (0, _eachMonthOfInterval.default)({
      start: analyse.date_debut_analyse,
      end: analyse.date_fin_analyse
    });
    const fiches_techniques_libres = await getFichesTechniquesLibres(id_analyse);
    const depensesMoisReelsParFicheTechnique = await getDepensesMoisReelsFichesTechniques(fiches_techniques_libres);

    let depensesMoisReels = _.flatten(depensesMoisReelsParFicheTechnique);

    depensesMoisReels = depensesMoisReels.filter(dep => (0, _isWithinInterval.default)(dep.mois_reel, {
      start: analyse.date_debut_analyse,
      end: analyse.date_fin_analyse
    }));
    let depensesMoisReelsAvecCoeff = depensesMoisReels.map(depense => {
      let coeffs = {
        coeff_surface_ou_nombre_animaux: 1,
        coeff_main_oeuvre_familiale: 0,
        coeff_intraconsommation: 0
      };
      fiches_techniques_libres.forEach(ftl => {
        if (ftl.id_fiche_technique === depense.id_fiche_technique) {
          coeffs.coeff_surface_ou_nombre_animaux = ftl.coeff_surface_ou_nombre_animaux;

          if (depense.libelle === "Main d'oeuvre") {
            coeffs.coeff_main_oeuvre_familiale = ftl.coeff_main_oeuvre_familiale;
          }
        }

        if (ftl.coeff_depenses !== null) {
          ftl.coeff_depenses.forEach(coeff_dep => {
            if (depense.libelle === coeff_dep.libelle_categorie) {
              coeffs.coeff_intraconsommation = coeff_dep.coeff_intraconsommation;
            }
          });
        }
      });
      return Object.assign(depense, coeffs);
    });
    depensesMoisReelsAvecCoeff.map(dep => {
      let montant_total = dep.montant * dep.coeff_surface_ou_nombre_animaux * (1 - dep.coeff_main_oeuvre_familiale) * (1 - dep.coeff_intraconsommation);
      return Object.assign(dep, {
        montant_total
      });
    });
    return depensesMoisReelsAvecCoeff;
  };

  doWork().then(responseBody => {
    response.status(200).json(responseBody);
  }).catch(e => {
    response.sendStatus(500);
  });
};

var _default = {
  getAnalyses,
  postAnalyse,
  getAnalyseById,
  putAnalyseById,
  deleteAnalyseById,
  getAnalyseFluxFichesLibresById
};
exports.default = _default;