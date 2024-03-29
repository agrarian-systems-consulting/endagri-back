import dbConn from '../../db/pool';
const _ = require('lodash');
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval';
import { format } from 'date-fns';
import isWithinInterval from 'date-fns/isWithinInterval';

// ---- LISTER TOUTES LES ANALYSES ---- //
const getAnalyses = (request, response) => {
  const getAnalysesQuery = `SELECT * FROM analyse_fiche.analyse ORDER BY id ASC`;
  dbConn.pool.query(getAnalysesQuery, (error, results) => {
    if (error) {
      console.error(error);
      response.sendStatus(500);

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
        console.error(error);
        response.sendStatus(500);
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
  FROM analyse_fiche.analyse a WHERE a.id=$1`; //a.created,a.modified,
  dbConn.pool.query(getInfoAnalyse, [id_analyse], (error, results) => {
    if (error) {
      console.error(error);
      response.sendStatus(500);
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
        console.error(error);
        response.sendStatus(500);
      }
      const infoFTL = results.rows;
      let resultjson = _.extend({}, infoAnalyse, {
        fiches_techniques_libres: [infoFTL],
      });
      response.status(200).send(resultjson);
    });
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
        console.error(error);
        response.sendStatus(500);
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
        console.error(err);
        response.sendStatus(500);
      }
      if (res.rows[0] !== undefined) {
        response.status(200).send(res.rows[0]);
      } else {
        response.sendStatus(404);
      }
    }
  );
};

//
const getAnalyseFluxFichesLibresById = async (request, response) => {
  const id_analyse = request.params.id;

  // Construction d'une Promise pour récupérer les informations de l'analyse
  const getAnalyse = (id_analyse) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `SELECT a.id,a.nom_utilisateur,a.nom_client,a.montant_tresorerie_initiale,a.date_debut_analyse,a.date_fin_analyse
  FROM analyse_fiche.analyse a WHERE a.id=$1`,
        [id_analyse],
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

  // Construction d'une Promise pour récupérer les fiches techniques libres de l'analyse
  const getFichesTechniquesLibres = (id_analyse) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `SELECT ftl.id id_ftl,ftl.id_fiche_technique::integer,ftl.date_ini,ftl.coeff_surface_ou_nombre_animaux::integer,ftl.coeff_main_oeuvre_familiale::integer,
        (SELECT json_agg(json_build_object('libelle_categorie',cfv.libelle_categorie,'coeff_autoconsommation',cfv.coeff_autoconsommation,
        'coeff_intraconsommation',cfv.coeff_intraconsommation,'coeff_rendement',cfv.coeff_rendement)) coeff_ventes FROM analyse_fiche.coeff_vente cfv 
          WHERE cfv.id_fiche_technique_libre=ftl.id) coeff_ventes, 
            (SELECT json_agg(json_build_object('libelle_categorie',cfd.libelle_categorie,'coeff_intraconsommation',cfd.coeff_intraconsommation)) coeff_depenses 
            FROM analyse_fiche.coeff_depense cfd WHERE cfd.id_fiche_technique_libre=ftl.id) coeff_depenses
        FROM analyse_fiche.fiche_technique_libre ftl WHERE ftl.id_analyse=$1 ORDER BY ftl.id`,
        [id_analyse],
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

  // Construction d'une Promise pour récupérer les dépenses associées à une fiche technique
  const promiseGetDepensesMoisReelsFicheTechnique = (
    id_fiche,
    date_ini_formatted
  ) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT 
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
          `,
        [id_fiche, date_ini_formatted],
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

  const getDepensesMoisReelsFichesTechniques = async (
    fiches_techniques_libres
  ) => {
    return Promise.all(
      fiches_techniques_libres.map((ftl) => {
        return promiseGetDepensesMoisReelsFicheTechnique(
          ftl.id_fiche_technique,
          format(ftl.date_ini, 'yyyy-MM-dd')
        );
      })
    );
  };

  const doWork = async () => {
    const analyse = await getAnalyse(id_analyse);

    // Créer un array de mois compris entre date de début et de fin d'analyse
    const arrayMoisReels = eachMonthOfInterval({
      start: analyse.date_debut_analyse,
      end: analyse.date_fin_analyse,
    });

    // Récupérer les fiches techniques libres associées à l'analyse
    const fiches_techniques_libres = await getFichesTechniquesLibres(
      id_analyse
    );

    const depensesMoisReelsParFicheTechnique = await getDepensesMoisReelsFichesTechniques(
      fiches_techniques_libres
    );

    // Simplifier l'array
    let depensesMoisReels = _.flatten(depensesMoisReelsParFicheTechnique);

    // Ne garder que les dépenses dans les mois de la période d'analyse
    depensesMoisReels = depensesMoisReels.filter((dep) =>
      isWithinInterval(dep.mois_reel, {
        start: analyse.date_debut_analyse,
        end: analyse.date_fin_analyse,
      })
    );

    // Boucler sur l'array des dépenses pour appliquer les coefficients
    let depensesMoisReelsAvecCoeff = depensesMoisReels.map((depense) => {
      let coeffs = {
        coeff_surface_ou_nombre_animaux: 1,
        coeff_main_oeuvre_familiale: 0,
        coeff_intraconsommation: 0,
      };

      // Insérer les coefficients surface et main d'oeuvre familiale
      fiches_techniques_libres.forEach((ftl) => {
        if (ftl.id_fiche_technique === depense.id_fiche_technique) {
          coeffs.coeff_surface_ou_nombre_animaux =
            ftl.coeff_surface_ou_nombre_animaux;

          if (depense.libelle === "Main d'oeuvre") {
            coeffs.coeff_main_oeuvre_familiale =
              ftl.coeff_main_oeuvre_familiale;
          }
        }

        // Ajoute le coefficient d'intraconsommation sur certains catégories de dépenses
        if (ftl.coeff_depenses !== null) {
          ftl.coeff_depenses.forEach((coeff_dep) => {
            if (depense.libelle === coeff_dep.libelle_categorie) {
              coeffs.coeff_intraconsommation =
                coeff_dep.coeff_intraconsommation;
            }
          });
        }
      });

      return Object.assign(depense, coeffs);
    });

    // Calculer les nouvelles valeurs en tenant compte des coefficients
    depensesMoisReelsAvecCoeff.map((dep) => {
      let montant_total =
        dep.montant *
        dep.coeff_surface_ou_nombre_animaux *
        (1 - dep.coeff_main_oeuvre_familiale) *
        (1 - dep.coeff_intraconsommation);
      return Object.assign(dep, { montant_total });
    });

    // Faire la même avec les ventes...

    // Calculer le solde (peut-être fait en front)

    // Calculer le solde cumulé (peut-être fait en front)
    return depensesMoisReelsAvecCoeff;
  };

  // Appel de la fonction asynchrone principale et renvoie la réponse
  doWork()
    .then((responseBody) => {
      response.status(200).json(responseBody);
    })
    .catch((e) => {
      //console.log(chalk.red.bold(e));
      response.sendStatus(500);
    });
};

export default {
  getAnalyses,
  postAnalyse,
  getAnalyseById,
  putAnalyseById,
  deleteAnalyseById,
  getAnalyseFluxFichesLibresById,
};
