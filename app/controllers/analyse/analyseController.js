import dbConn from '../../db/pool';
const _ = require('lodash');
const fetch = require('node-fetch');
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval';
import chalk from 'chalk';
import { format } from 'date-fns';
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
  FROM analyse_fiche.analyse a WHERE a.id=$1`; //a.created,a.modified,
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
            reject(err);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  // Construction d'une Promise pour récupérer les informations de l'analyse
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
            reject(err);
          }
          resolve(res.rows);
        }
      );
    });
  };

  // Construction d'une Promise pour récupérer les informations de l'analyse
  const getFicheTechniqueById = (id_fiche) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `
          SELECT *
          FROM fiche.fiche_technique 
          WHERE id=$1 
          `,
        [id_fiche],
        (err, res) => {
          if (err) {
            reject(err);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  // Construction d'une Promise pour récupérer les dépenses associées à une fche technique
  const getDepensesMoisReelsFicheTechnique = (id_fiche, date_ini_formatted) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT 
          CASE
            WHEN act.mois IS NOT NULL 
              THEN $2::timestamp + interval '1 month' * act.mois::integer
              ELSE $2::timestamp + interval '1 month' * act.mois_relatif::integer
            END as mois_reel,
            act.mois_relatif,
            act.mois,
            act.id_fiche_technique,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',d.id,
              'id_activite',d.id_activite,
              'id_fiche_technique',act.id_fiche_technique,
              'libelle_depense',d.libelle,
              'montant_depense',d.montant)
              ) depenses
          FROM fiche.activite act 
            JOIN fiche.depense d ON act.id=d.id_activite 
            JOIN fiche.fiche_technique f ON act.id_fiche_technique=f.id 
          WHERE f.id=$1 
          GROUP BY mois_reel,act.mois_relatif,act.mois,act.id_fiche_technique 
          ORDER BY mois_reel`,
        [id_fiche, date_ini_formatted],
        (err, res) => {
          if (err) {
            reject(err);
          }
          console.log(res.rows);
          resolve(res.rows);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async () => {
    // Récupérer les informations de base de l'analyse
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

    // Récupérer pour chaque fiche_technique_libre, la fiche technique associée
    const data = await fiches_techniques_libres.map(
      async ({ id_fiche_technique, date_ini }) => {
        const fiche_technique = await getFicheTechniqueById(id_fiche_technique);

        // Problème ici sur le formatage de la date
        // 2019-12-31T23:00:00.000Z donne 2020-01-01
        const date_ini_formatted = format(date_ini, 'yyyy-MM-dd');
        console.log('date_ini = ', date_ini);
        console.log('date_ini_formatted = ', date_ini_formatted);

        const depensesMoisReelsFicheTechnique = await getDepensesMoisReelsFicheTechnique(
          id_fiche_technique,
          date_ini_formatted
        );

        return depensesMoisReelsFicheTechnique;
      }
    );

    console.log(data);
  };

  // Appel de la fonction asynchrone principale et renvoie la réponse
  doWork()
    .then((responseBody) => {
      response.status(200).json(responseBody);
    })
    .catch((e) => {
      console.log(chalk.red.bold(e));
      response.sendStatus(500);
    });

  // Etape 1
  // Créer l'array des mois réels compris entre le début et la fin d'analyse

  // // Step 1 Fetch analyse/:id
  // // Step 2 A partir de date_debut_analyse et date_fin_analyse, créer un array de mois analysés
  // const periode_analyse = [];
  // const coeff_ventes = [];
  // const coeff_general_surf = [];
  // const idFicheTechnique = [];
  // try {
  //   fetch('http://localhost:3333/analyse/' + id_analyse + '').then(
  //     async (response) => {
  //       const data = await response.json();

  //       // Créer l'array de mois réels
  //       periode_analyse.push(
  //         data[Object.keys(data)[0]].date_debut_analyse,
  //         data[Object.keys(data)[0]].date_fin_analyse
  //       );

  //       // R2cupérer toutes les données de toutes les fiches techniques libres
  //       const fiches_techniques_libres = data.fiches_techniques_libres[0];

  //       fiches_techniques_libres.map((e) => {
  //         coeff_ventes.push(e.coeff_ventes);
  //         //add coeff_depenses
  //         coeff_general_surf.push(e.coeff_surface_ou_nombre_animaux);
  //         idFicheTechnique.push(e.id_fiche_technique);
  //       });

  //       // Step 3 Fetch flux mensuels par catégorie, (les )dépenses et les ventes) controller FluxMoisReelsMoisCatController.js
  //       idFicheTechnique.map((e) => {
  //         console.log('id_fiche_techique' + e);
  //         try {
  //           fetch(
  //             'http://localhost:3333/fiche/' +
  //               e +
  //               '/flux_mois_reels_mois_categorie'
  //           ).then(async (response) => {
  //             const data = await response.json();
  //             const flux = data.flux[0];
  //             // Step 4 Dépenses : On boucle sur les flux mensuels de dépenses, si categories_depenses.libelle_categorie = libelle_coeff_depense (Boucler sur coeff_depenses)
  //             flux.map((e) => {
  //               let moisReelsFlux = e.mois_reel;
  //               let categoriesDepenses = e.categories_depenses;

  //               for (var i = 0; i < categoriesDepenses.length; i++) {
  //                 for (var j = 0; j < coeff_ventes.length; j++) {
  //                   // - Si match, on applique le coeff_intraconsommation sur categories_depenses.total_depenses_categorie
  //                   // ET le coeff général surface
  //                   // ET SI categories_depenses.libelle_categorie = "Main d'oeuvre"",on applique le coeff général main d'oeuvre familial
  //                   if (
  //                     categoriesDepenses[i].libelle_categorie ===
  //                     coeff_ventes[j].libelle_categorie
  //                   ) {
  //                     //console.log('yes :'+categoriesDepenses[i].libelle_categorie+' <=> '+coeff_ventes[j].libelle_categorie+'');
  //                     let opeCategorieDepense =
  //                       coeff_ventes[j].coeff_intraconsommation *
  //                       categoriesDepenses[i].total_depenses_categorie;
  //                   } else {
  //                     //console.log('no');
  //                   }
  //                 }
  //               }
  //             });
  //           });
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       });
  //     }
  //   );
  // } catch (error) {
  //   console.log(error);
  // }
  //response.status(200).send(periode_analyse)

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
  getAnalyseFluxFichesLibresById,
};
