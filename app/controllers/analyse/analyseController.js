import dbConn from '../../db/pool';
const _ = require('lodash');

// ---- LISTER TOUTES LES ANALYSES ---- //
const getAnalyses = (request, response) => {
  const getAnalysesQuery = `SELECT * FROM analyse_fiche.analyse ORDER BY id ASC`;
  dbConn.pool.query(getAnalysesQuery, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
};

// ---- CREER UNE NOUVELLE ANALYSE ---- //
const postAnalyse = (request, response) => {
  const {
    nom_utilisateur,
    nom_client,
    montant_tresorerie_initiale,
    date_debut_analyse,
    date_fin_analyse,
  } = request.body;

  dbConn.pool.query(
    `INSERT INTO analyse_fiche.analyse(
      id,
      nom_utilisateur,
      nom_client,
      montant_tresorerie_initiale,
      date_debut_analyse,
      date_fin_analyse) 
      VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING *`,
    [
      nom_utilisateur,
      nom_client,
      montant_tresorerie_initiale,
      date_debut_analyse,
      date_fin_analyse,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(results.rows[0]);
    }
  );
};

// ---- RECUPERER LES INFORMATIONS D'UNE ANALYSE ---- //
// Modifier la requête parceque ne renvoie rien si l'analyse n'a pas de fiches techniques libres associées ou de dépenses libres associées
// Problème : Renvoie plusieurs fois la même dépense libre
// Renvoyer l'id des fiches_techniques libres également
const getAnalyseById = (request, response) => {
  const id_analyse = request.params.id;

  const getInfoAnalyse = `SELECT a.id,a.nom_utilisateur,a.nom_client,a.montant_tresorerie_initiale,a.date_debut_analyse,a.date_fin_analyse
  FROM analyse_fiche.analyse a WHERE a.id=$1`;//a.created,a.modified,
  dbConn.pool.query(getInfoAnalyse, [id_analyse], (error, results) => {
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
    dbConn.pool.query(getInfoFTL, [id_analyse], (error, results) => {
      if (error) {
        throw error;
      }
      const infoFTL = results.rows;
      let resultjson = _.extend({}, infoAnalyse, {
        "fiches_techniques_libres": [infoFTL],
      });
      response.status(200).send(resultjson);
    })
  });
};

// ---- CREER MODIFIER UNE ANALYSE ---- //
const putAnalyseById = (request, response) => {
  const id_analyse = request.params.id;

  const {
    nom_utilisateur,
    nom_client,
    montant_tresorerie_initiale,
    date_debut_analyse,
    date_fin_analyse,
  } = request.body;

  dbConn.pool.query(
    `UPDATE analyse_fiche.analyse SET
      nom_utilisateur = $2,
      nom_client = $3,
      montant_tresorerie_initiale = $4,
      date_debut_analyse = $5,
      date_fin_analyse = $6 
      WHERE id=$1 RETURNING *`,
    [
      id_analyse,
      nom_utilisateur,
      nom_client,
      montant_tresorerie_initiale,
      date_debut_analyse,
      date_fin_analyse,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(results.rows[0]);
    }
  );
};

// ---- CREER MODIFIER UNE ANALYSE ---- //
const deleteAnalyseById = (request, response) => {
  const id_analyse = request.params.id;

  dbConn.pool.query(
    `DELETE FROM analyse_fiche.analyse 
      WHERE id=$1 RETURNING *`,
    [id_analyse],
    (err, res) => {
      if (err) {
        throw err;
      }
      if (res.rows[0] !== undefined) {
        response.status(200).send(res.rows[0]);
      } else {
        response.sendStatus(404);
      }
    }
  );
};

const getAnalyseFluxMoisFiche = (request, response) => {

  // Step 1 Fetch analyse/:id
  // Step 2 A partir de date_debut_analyse et date_fuin_analyse, créer un array de mois analysés
  // Step 3 Fetch flux mensuels par catégorie, (les )dépenses et les ventes) controller FluxMoisReelsMoisCatController.js
  // Step 4 Dépenses : On boucle sur les flux mensuels de dépenses, si categories_depenses.libelle_categorie = libelle_coeff_depense (Boucler sur coeff_depenses)
  // - Si match, on applique le coeff_intraconsommation sur categories_depenses.total_depenses_categorie
  // ET le coeff général surface
  // ET SI categories_depenses.libelle_categorie = "Main d'oeuvre"",on applique le coeff général main d'oeuvre familial
  // Step 5 Ventes : On boucle sur les flux mensuels de ventes, si categories_ventes.libelle_categorie = coeff_vente.libelle_categorie (on boucle dessus)
  // - Si match, on applique les trois coeff + le principal surface_nom_de_meres.
  // Step 6 Faire les sommes des ventes et dépenses
  // Step 7 Solde et Solde cumulé
  // Step 8 Contruire le json complet
};

export default {
  getAnalyses,
  postAnalyse,
  getAnalyseById,
  putAnalyseById,
  deleteAnalyseById,
};
