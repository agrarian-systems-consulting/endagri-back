"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("../../db/pool"));

var _eachMonthOfInterval = _interopRequireDefault(require("date-fns/eachMonthOfInterval"));

var _chalk = _interopRequireDefault(require("chalk"));

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
    date_fin_analyse,
    created
  } = request.body;

  _pool.default.pool.query(`INSERT INTO analyse_fiche.analyse(
      id,
      nom_utilisateur,
      nom_client,
      montant_tresorerie_initiale,
      date_debut_analyse,
      date_fin_analyse,created) 
      VALUES (DEFAULT, $1, $2, $3, $4, $5,$6) RETURNING *`, [nom_utilisateur, nom_client, montant_tresorerie_initiale, date_debut_analyse, date_fin_analyse, created], (error, results) => {
    if (error) {
      throw error;
    }

    response.status(200).send(results.rows[0]);
  });
};

const getAnalyseById = (request, response) => {
  const id = request.params.id;

  const promiseGetAnalyse = id => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(` SELECT a.*
          FROM analyse_fiche.analyse a
          WHERE a.id=$1
         `, [id], (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        resolve(res.rows[0]);
      });
    });
  };

  const promiseGetFichesTechniquesLibres = id_analyse => {
    return new Promise((resolve, reject) => {
      _pool.default.pool.query(` SELECT 
            f.*,
            ft.libelle libelle_fiche_technique,
            p.libelle libelle_production,
            p.type_production type_production
           
          FROM 
            analyse_fiche.fiche_technique_libre f

          LEFT JOIN fiche.fiche_technique ft
            ON ft.id = f.id_fiche_technique::integer
          LEFT JOIN fiche.production p
            ON ft.id_production::integer = p.id
          WHERE 
            f.id_analyse=$1
          GROUP BY 
            f.id, ft.id, p.id
         `, [id_analyse], (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        resolve(res.rows);
      });
    });
  };

  const doWork = async id => {
    const analyse = await promiseGetAnalyse(id);
    analyse.fiches_techniques_libres = await promiseGetFichesTechniquesLibres(analyse.id);
    return analyse;
  };

  doWork(id).then(res => {
    response.status(200).json(res);
  }).catch(err => {
    console.log(err);
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
      _pool.default.pool.query(` SELECT 
            a.id,
            a.nom_utilisateur,
            a.nom_client,
            a.montant_tresorerie_initiale,
            a.date_debut_analyse,
            a.date_fin_analyse
          FROM analyse_fiche.analyse a 
          WHERE a.id=$1`, [id_analyse], (err, res) => {
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

  const promiseGetVentesMoisReelsFicheTechnique = (id_fiche, date_ini_formatted) => {
    return new Promise((resolve, reject) => {
      const getVenteFicheQuery = `SELECT 
      CASE
        WHEN v.mois IS NOT NULL THEN CONCAT('prix_',TO_char(to_date(CONCAT(to_char($2::timestamp,'YYYY'), '-', LPAD(v.mois::text,2, '0')), 'YYYY-MM')::timestamp,'month')) 
        ELSE CONCAT('prix_',TO_CHAR($2::timestamp + interval '1 month' * v.mois_relatif::integer,'month'))
      END as col_prix_marche
      FROM fiche.vente v JOIN fiche.marche m ON v.id_marche = m.id WHERE v.id_fiche_technique=$1`;

      _pool.default.pool.query(getVenteFicheQuery, [id_fiche, date_ini_formatted], (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        const prix_marche = res.rows[0].col_prix_marche;
        const getVenteMoisReelsByIdQuery = `
          WITH subquery AS(
            SELECT 
              CASE
                WHEN v.mois IS NOT NULL THEN to_date(CONCAT(to_char($2::timestamp,'YYYY'), '-', v.mois), 'YYYY-MM')
                ELSE $2::timestamp + interval '1 month' * v.mois_relatif::integer
              END mois_reel,
              v.id_fiche_technique id_fiche_technique,
              SUM(m.${prix_marche}*v.rendement) total_ventes_categorie,
              CONCAT((SELECT p.libelle FROM fiche.produit p WHERE id=m.id_produit ),' ', m.type_marche, ' ', m.localisation) libelle_marche
            FROM 
              fiche.vente v 
            JOIN 
              fiche.marche m ON v.id_marche = m.id
            WHERE 
              v.id_fiche_technique=$1 
            GROUP BY 
              id_fiche_technique, 
              libelle_marche,
              mois_reel 
            ORDER BY 
              mois_reel
          )
          SELECT id_fiche_technique::integer, mois_reel ,SUM(total_ventes_categorie)::integer montant,libelle_marche as libelle_categorie FROM subquery
          GROUP BY id_fiche_technique, mois_reel, libelle_marche ORDER BY mois_reel`;

        _pool.default.pool.query(getVenteMoisReelsByIdQuery, [id_fiche, date_ini_formatted], (error, res) => {
          if (error) {
            console.log(err);
            reject(err);
          }

          resolve(res.rows);
        });
      });
    });
  };

  const getVentesMoisReelsFichesTechniques = async fiches_techniques_libres => {
    return Promise.all(fiches_techniques_libres.map(ftl => {
      return promiseGetVentesMoisReelsFicheTechnique(ftl.id_fiche_technique, (0, _dateFns.format)(ftl.date_ini, 'yyyy-MM-dd'));
    }));
  };

  const doWork = async () => {
    const analyse = await getAnalyse(id_analyse);
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
    const fluxDepenses = depensesMoisReelsAvecCoeff.map(dep => {
      let montant_total = dep.montant * dep.coeff_surface_ou_nombre_animaux * (1 - dep.coeff_main_oeuvre_familiale) * (1 - dep.coeff_intraconsommation);
      return Object.assign(dep, {
        montant_total
      });
    });
    const ventesMoisReelsParFicheTechnique = await getVentesMoisReelsFichesTechniques(fiches_techniques_libres);

    let ventesMoisReels = _.flatten(ventesMoisReelsParFicheTechnique);

    ventesMoisReels = ventesMoisReels.filter(vente => (0, _isWithinInterval.default)(vente.mois_reel, {
      start: analyse.date_debut_analyse,
      end: analyse.date_fin_analyse
    }));
    let ventesMoisReelsAvecCoeff = ventesMoisReels.map(vente => {
      let coeffs = {
        coeff_surface_ou_nombre_animaux: 1,
        coeff_rendement: 1,
        coeff_autoconsommation: 0,
        coeff_intraconsommation: 0
      };
      fiches_techniques_libres.forEach(ftl => {
        if (ftl.id_fiche_technique === vente.id_fiche_technique) {
          coeffs.coeff_surface_ou_nombre_animaux = ftl.coeff_surface_ou_nombre_animaux;

          if (ftl.coeff_ventes !== null) {
            ftl.coeff_ventes.forEach(coeff_ven => {
              if (vente.libelle_categorie === coeff_ven.libelle_categorie) {
                coeffs.coeff_rendement = coeff_ven.coeff_rendement;
                coeffs.coeff_intraconsommation = coeff_ven.coeff_intraconsommation;
                coeffs.coeff_autoconsommation = coeff_ven.coeff_autoconsommation;
              }
            });
          }
        }
      });
      return Object.assign(vente, coeffs);
    });
    const fluxVentes = ventesMoisReelsAvecCoeff.map(vente => {
      let montant_total = parseInt(vente.montant * vente.coeff_surface_ou_nombre_animaux * vente.coeff_rendement * (1 - vente.coeff_autoconsommation) * (1 - vente.coeff_intraconsommation), 10);
      return Object.assign(vente, {
        montant_total
      });
    });
    let arrayMoisReels = (0, _eachMonthOfInterval.default)({
      start: analyse.date_debut_analyse,
      end: analyse.date_fin_analyse
    });
    arrayMoisReels = arrayMoisReels.map(mois => {
      return {
        mois: (0, _dateFns.format)(mois, 'yyyy-MM'),
        total_depenses: 0,
        total_ventes: 0,
        solde: 0,
        solde_cumule: 0,
        depenses: [],
        ventes: []
      };
    });
    fluxVentes.forEach(vente => {
      arrayMoisReels.map(mois => {
        if (mois.mois == (0, _dateFns.format)(vente.mois_reel, 'yyyy-MM')) {
          mois.ventes.push(_.omit(vente, 'mois_reel'));
          mois.total_ventes += vente.montant_total;
          mois.solde += vente.montant_total;
        }
      });
    });
    fluxDepenses.forEach(depense => {
      arrayMoisReels.map(mois => {
        if (mois.mois == (0, _dateFns.format)(depense.mois_reel, 'yyyy-MM')) {
          mois.depenses.push(_.omit(depense, 'mois_reel'));
          mois.total_depenses += depense.montant_total;
          mois.solde -= depense.montant_total;
        }
      });
    });
    let solde_cumule = analyse.montant_tresorerie_initiale;
    arrayMoisReels.map(mois => {
      solde_cumule += mois.solde;
      mois.solde_cumule = solde_cumule;
    });
    return arrayMoisReels;
  };

  doWork().then(responseBody => {
    response.status(200).json(responseBody);
  }).catch(e => {
    console.log(_chalk.default.red.bold(e));
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