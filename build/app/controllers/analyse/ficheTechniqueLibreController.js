"use strict";

var _pool = _interopRequireDefault(require("../../db/pool"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const postFicheTechniqueLibre = (request, response) => {
  const id_analyse = request.params.id_analyse;
  const {
    date_ini,
    coeff_surface_ou_nombre_animaux,
    coeff_main_oeuvre_familiale,
    coeff_ventes,
    coeff_depenses
  } = request.body;

  const promiseAjoutFicheTechniqueLibre = () => {
    return new Promise((resolve, reject) => {
      const postFicheTechniqueLibreQuery = `INSERT INTO analyse_fiche.fiche_technique_libre(id, date_ini, coeff_surface_ou_nombre_animaux, coeff_main_oeuvre_familiale, id_analyse)
      VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *`;

      _pool.default.pool.query(postFicheTechniqueLibreQuery, [date_ini, coeff_surface_ou_nombre_animaux, coeff_main_oeuvre_familiale, id_analyse], (error, results) => {
        if (error) {
          return reject(error);
        }

        const id_fiche_technique_libre = results.rows[0].id;
        resolve(id_fiche_technique_libre);
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
      const postCoeffVenteQuery = `INSERT INTO analyse_fiche.coeff_vente(id, id_fiche_technique_libre,libelle_categorie,coeff_autoconsommation,coeff_intraconsommation,coeff_rendement) 
      VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING *`;

      _pool.default.pool.query(postCoeffVenteQuery, [id_fiche_technique_libre, libelle_categorie, coeff_autoconsommation, coeff_intraconsommation, coeff_rendement], (error, results) => {
        if (error) {
          reject(error);
        }

        resolve('Coeff Vente ajoutée', results.rows[0]);
      });
    });
  };

  const asyncPromiseCoeffVente = async (coeff_vente, id_fiche_technique_libre) => {
    return promiseCoeffVente(coeff_vente, id_fiche_technique_libre);
  };

  const ajouterCoeffVentes = async id_fiche_technique_libre => {
    return Promise.all(coeff_ventes.map(coeff_vente => asyncPromiseCoeffVente(coeff_vente, id_fiche_technique_libre)));
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

  const asyncPromiseCoeffDepense = async (coeff_depense, id_fiche_technique_libre) => {
    return promiseCoeffDepense(coeff_depense, id_fiche_technique_libre);
  };

  const ajouterCoeffDepenses = async id_fiche_technique_libre => {
    return Promise.all(coeff_depenses.map(coeff_depense => asyncPromiseCoeffDepense(coeff_depense, id_fiche_technique_libre)));
  };

  const getAnalyse = id_analyse => {
    return new Promise((resolve, reject) => {});
  };

  const doAjouterFicheTechniqueLibreEtCoeffVentesEtCoeffDepenses = async () => {
    const id_fiche_technique_libre = await promiseAjoutFicheTechniqueLibre();

    if (coeff_ventes != undefined) {
      await ajouterCoeffVentes(id_fiche_technique_libre);
    }

    if (coeff_depenses != undefined) {
      await ajouterCoeffDepenses(id_fiche_technique_libre);
    }

    const responseBody = await getAnalyse(id_fiche_technique_libre);
    return responseBody;
  };

  doAjouterFicheTechniqueLibreEtCoeffVentesEtCoeffDepenses().then(result => {
    response.status(201).json(result);
  }).catch(e => console.log(chalk.red.bold(e)));
};

module.exports = {
  postFicheTechniqueLibre
};