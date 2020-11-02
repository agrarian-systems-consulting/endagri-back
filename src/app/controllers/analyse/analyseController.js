import dbConn from '../../db/pool';
const _ = require('lodash');
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval';
import chalk from 'chalk';
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
    created,
  } = request.body;

  dbConn.pool.query(
    `INSERT INTO analyse_fiche.analyse(
      id,
      nom_utilisateur,
      nom_client,
      montant_tresorerie_initiale,
      date_debut_analyse,
      date_fin_analyse,created) 
      VALUES (DEFAULT, $1, $2, $3, $4, $5,$6) RETURNING *`,
    [
      nom_utilisateur,
      nom_client,
      montant_tresorerie_initiale,
      date_debut_analyse,
      date_fin_analyse,
      created,
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

// ---- RECUPERER TOUTES LES INFORMATIONS D'UNE ANALYSE ---- //
const getAnalyseById = (request, response) => {
  const id = request.params.id;

  const promiseGetAnalyse = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT a.*
          FROM analyse_fiche.analyse a
          WHERE a.id=$1
         `,
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

  // Récupérer les fiches techniques libres associées à l'analyse
  const promiseGetFichesTechniquesLibres = (id_analyse) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT 
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
         `,
        [id_analyse],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(res.rows);
        }
      );
    });
  };

  // Récupérer toutes les dépenses libres associées à l'analyse
  const promiseGetDepensesLibres = (id_analyse) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT 
          id, 
          libelle, 
          mois_reel, 
          montant 
        FROM 
          analyse_fiche.depense_libre 
        WHERE 
          id_analyse=$1 
        ORDER BY id ASC
         `,
        [id_analyse],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(res.rows);
        }
      );
    });
  };

  // Fonction pour enchaîner les promises
  const doWork = async (id) => {
    const analyse = await promiseGetAnalyse(id);
    analyse.fiches_techniques_libres = await promiseGetFichesTechniquesLibres(
      analyse.id
    );

    analyse.depenses_libres = await promiseGetDepensesLibres(analyse.id);

    return analyse;
  };

  doWork(id)
    .then((res) => {
      response.status(200).json(res);
    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(404);
    });
};

// ----  MODIFIER UNE ANALYSE ---- //
const putAnalyseById = (request, response) => {
  const id_analyse = request.params.id;

  const {
    nom_utilisateur,
    nom_client,
    montant_tresorerie_initiale,
    date_debut_analyse,
    date_fin_analyse,
    modified,
  } = request.body;

  dbConn.pool.query(
    `UPDATE analyse_fiche.analyse SET
      nom_utilisateur = $2,
      nom_client = $3,
      montant_tresorerie_initiale = $4,
      date_debut_analyse = $5,
      date_fin_analyse = $6,
      modified = $7 
      WHERE id=$1 RETURNING *`,
    [
      id_analyse,
      nom_utilisateur,
      nom_client,
      montant_tresorerie_initiale,
      date_debut_analyse,
      date_fin_analyse,
      modified,
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

// ---- SUPPRIMER UNE ANALYSE ---- //
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

// --- RECUPERER LE FLUX FINANCIER DE L'ANALYSE DE TRESORERIE --- //
const getAnalyseFluxFichesLibresById = async (request, response) => {
  const id_analyse = request.params.id;

  // Construction d'une Promise pour récupérer les informations de l'analyse
  const getAnalyse = (id_analyse) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT 
            a.id,
            a.nom_utilisateur,
            a.nom_client,
            a.montant_tresorerie_initiale,
            a.date_debut_analyse,
            a.date_fin_analyse
          FROM analyse_fiche.analyse a 
          WHERE a.id=$1`,
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
        `SELECT 
        ftl.id id_ftl,
        ftl.id_fiche_technique::integer,
        ftl.date_ini,
        ftl.coeff_surface_ou_nombre_animaux::real,
        ftl.coeff_main_oeuvre_familiale::real,
        (SELECT 
          json_agg(
            json_build_object(
              'libelle_categorie',cfv.libelle_categorie,
              'coeff_autoconsommation',cfv.coeff_autoconsommation,
              'coeff_intraconsommation',cfv.coeff_intraconsommation,
              'coeff_rendement',cfv.coeff_rendement
              )
            ) coeff_ventes 
          FROM 
            analyse_fiche.coeff_vente cfv 
          WHERE 
            cfv.id_fiche_technique_libre=ftl.id) coeff_ventes, 
            (SELECT 
              json_agg(
                json_build_object(
                  'libelle_categorie',cfd.libelle_categorie,
                  'coeff_intraconsommation',cfd.coeff_intraconsommation
                  )
                ) coeff_depenses 
            FROM 
              analyse_fiche.coeff_depense cfd 
            WHERE 
              cfd.id_fiche_technique_libre=ftl.id
            ) coeff_depenses
        FROM 
          analyse_fiche.fiche_technique_libre ftl 
        WHERE 
          ftl.id_analyse=$1 
        ORDER BY 
          ftl.id`,
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
            console.log(err);
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

  // Construction d'une Promise pour récupérer les ventes associées à une fiche technique
  const promiseGetVentesMoisReelsFicheTechnique = (
    id_fiche,
    date_ini_formatted
  ) => {
    return new Promise((resolve, reject) => {
      // TODO : le calcul du mois réel devrait prendre en compte une année de référence. Là on prend l'année en cours par défaut ce qui cause des problèmes sur les cycles qui sont sur plusieurs années civiles
      const getVenteFicheQuery = `SELECT
      CASE
        WHEN v.mois IS NOT NULL THEN CONCAT('prix_',TO_char(to_date(CONCAT(to_char($2::timestamp,'YYYY'), '-', LPAD(v.mois::text,2, '0')), 'YYYY-MM')::timestamp,'month')) 
        ELSE CONCAT('prix_',TO_CHAR($2::timestamp + interval '1 month' * v.mois_relatif::integer,'month'))
      END as mois_prix, 
       
      m.*,
      v.*,              
      CASE
        WHEN v.mois IS NOT NULL THEN to_date(CONCAT(to_char($2::timestamp,'YYYY'), '-', v.mois), 'YYYY-MM')
        ELSE $2::timestamp + interval '1 month' * v.mois_relatif::integer
      END as mois_reel,  
      CONCAT((SELECT p.libelle FROM fiche.produit p WHERE id=m.id_produit ),' ', m.type_marche, ' ', m.localisation) libelle_marche

      FROM fiche.vente v JOIN fiche.marche m ON v.id_marche = m.id WHERE v.id_fiche_technique=$1`;
      dbConn.pool.query(
        getVenteFicheQuery,
        [id_fiche, date_ini_formatted],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          // S'il n'y a pas de ventes associées, renvoyer un tableau vide
          if (res.rows[0] === undefined) {
            resolve(res.rows);
          } else {
            let ventes = res.rows;

            ventes.map((v) => {
              // Si aucun prix n'est défini, on lui donne la valeur de 0 pour ne faire buguer l'application (probablement inutile mais par précaution)
              if (v.mois_prix === undefined) {
                v.mois_prix = 0;
              }
              // Calculer le montant de la vente
              v.montant = v[v.mois_prix.trim()] * v.rendement;
            });

            resolve(res.rows);
          }
        }
      );
    });
  };

  const getVentesMoisReelsFichesTechniques = async (
    fiches_techniques_libres
  ) => {
    return Promise.all(
      fiches_techniques_libres.map((ftl) => {
        return promiseGetVentesMoisReelsFicheTechnique(
          ftl.id_fiche_technique,
          format(ftl.date_ini, 'yyyy-MM-dd')
        );
      })
    );
  };

  // Récupérer toutes les dépenses libres associées à l'analyse
  const promiseGetDepensesLibres = (id_analyse) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT 
            id, 
            libelle, 
            mois_reel, 
            montant 
          FROM 
            analyse_fiche.depense_libre 
          WHERE 
            id_analyse=$1 
          ORDER BY id ASC
           `,
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

  const doWork = async () => {
    const analyse = await getAnalyse(id_analyse);

    // Récupérer les fiches techniques libres associées à l'analyse
    const fiches_techniques_libres = await getFichesTechniquesLibres(
      id_analyse
    );

    // -- DEPENSES
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
          // Multiplier la dépense par la surface ou le nombre d'animaux
          coeffs.coeff_surface_ou_nombre_animaux =
            ftl.coeff_surface_ou_nombre_animaux;

          // Diminuer les dépenses de main d'oeuvre temporaire si le travail est fait par de la main d'oeuvre familiale
          if (depense.libelle === "Main d'oeuvre temporaire") {
            coeffs.coeff_main_oeuvre_familiale =
              ftl.coeff_main_oeuvre_familiale;
          }
        }

        // Ajoute le coefficient d'intraconsommation sur certains catégories de dépenses exemple : Fumier, paille, concentrés
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
    const fluxDepenses = depensesMoisReelsAvecCoeff.map((dep) => {
      let montant_total =
        dep.montant *
        dep.coeff_surface_ou_nombre_animaux *
        (1 - dep.coeff_main_oeuvre_familiale) *
        (1 - dep.coeff_intraconsommation);
      return Object.assign(dep, { montant_total });
    });

    // -- DEPENSES LIBRES
    const depensesLibres = await promiseGetDepensesLibres(id_analyse);

    // Ajouter les dépenses libres au flux des dépenses
    depensesLibres.map((dep) => {
      fluxDepenses.push({
        mois_reel: dep.mois_reel,
        id: dep.id,
        montant_total: dep.montant,
        libelle: dep.libelle,
      });
    });

    // -- VENTES
    const ventesMoisReelsParFicheTechnique = await getVentesMoisReelsFichesTechniques(
      fiches_techniques_libres
    );

    // Simplifier l'array
    let ventesMoisReels = _.flatten(ventesMoisReelsParFicheTechnique);

    // Ne garder que les dépenses dans les mois de la période d'analyse
    ventesMoisReels = ventesMoisReels.filter((vente) =>
      isWithinInterval(vente.mois_reel, {
        start: analyse.date_debut_analyse,
        end: analyse.date_fin_analyse,
      })
    );

    // Boucler sur l'array des ventes pour appliquer les coefficients
    let ventesMoisReelsAvecCoeff = ventesMoisReels.map((vente) => {
      // Coefficients par défaut
      let coeffs = {
        coeff_surface_ou_nombre_animaux: 1,
        coeff_rendement: 1,
        coeff_autoconsommation: 0,
        coeff_intraconsommation: 0,
      };

      // Insérer les coefficients surface
      fiches_techniques_libres.forEach((ftl) => {
        if (ftl.id_fiche_technique == vente.id_fiche_technique) {
          console.log(
            'Match',
            ftl.id_ftl,
            ' et ',
            vente.id,
            ' ont ',
            ftl.id_fiche_technique,
            ' en commun'
          );
          coeffs.coeff_surface_ou_nombre_animaux =
            ftl.coeff_surface_ou_nombre_animaux;

          console.log(ftl.coeff_ventes);

          //TODO : Ici il faudrait renommer libelle_categorie par id_marche, le match est bizarre mais fonctionne
          // Ajoute le coefficient d'intraconsommation sur certains catégories de dépenses
          if (ftl.coeff_ventes !== null) {
            ftl.coeff_ventes.forEach((coeff_ven) => {
              if (vente.id_marche == coeff_ven.libelle_categorie) {
                coeffs.coeff_rendement = coeff_ven.coeff_rendement;
                coeffs.coeff_intraconsommation =
                  coeff_ven.coeff_intraconsommation;
                coeffs.coeff_autoconsommation =
                  coeff_ven.coeff_autoconsommation;
              }
            });
          }
        }
      });

      return Object.assign(vente, coeffs);
    });

    console.log('1 ventesMoisReels', ventesMoisReelsAvecCoeff);

    // Calculer les valeurs en appliquant les coefficients sur les ventes
    const fluxVentes = ventesMoisReelsAvecCoeff.map((vente) => {
      let montant_total = parseInt(
        vente.montant *
          vente.coeff_surface_ou_nombre_animaux *
          vente.coeff_rendement *
          (1 - vente.coeff_autoconsommation) *
          (1 - vente.coeff_intraconsommation),
        10
      );
      return Object.assign(vente, { montant_total });
    });

    // -- MAPPER les ventes et dépenses sur l'array de mois réels

    // Créer un array de mois compris entre date de début et de fin d'analyse
    let arrayMoisReels = eachMonthOfInterval({
      start: analyse.date_debut_analyse,
      end: analyse.date_fin_analyse,
    });

    // Préparer l'array
    arrayMoisReels = arrayMoisReels.map((mois) => {
      return {
        mois: format(mois, 'yyyy-MM'),
        total_depenses: 0,
        total_ventes: 0,
        solde: 0,
        solde_cumule: 0,
        depenses: [], // On pourra utiliser ces arrays si on souhaite du détail sur l'origine des flux de dépenses et ventes
        ventes: [],
      };
    });

    // Mapper toutes les ventes
    fluxVentes.forEach((vente) => {
      arrayMoisReels.map((mois) => {
        if (mois.mois == format(vente.mois_reel, 'yyyy-MM')) {
          mois.ventes.push(_.omit(vente, 'mois_reel'));
          mois.total_ventes += vente.montant_total;
          mois.solde += vente.montant_total;
        }
      });
    });

    // Mapper toutes les depenses
    fluxDepenses.forEach((depense) => {
      arrayMoisReels.map((mois) => {
        if (mois.mois == format(depense.mois_reel, 'yyyy-MM')) {
          mois.depenses.push(_.omit(depense, 'mois_reel'));
          mois.total_depenses += depense.montant_total;
          mois.solde -= depense.montant_total;
        }
      });
    });

    // Calculer le solde cumulé en tenant compte de la trésorerie initiale compte de la trésorerie initiale
    let solde_cumule = analyse.montant_tresorerie_initiale;
    arrayMoisReels.map((mois) => {
      solde_cumule += mois.solde;
      mois.solde_cumule = solde_cumule;
    });

    // Return la totalité de l'objet
    return arrayMoisReels;
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
};

export default {
  getAnalyses,
  postAnalyse,
  getAnalyseById,
  putAnalyseById,
  deleteAnalyseById,
  getAnalyseFluxFichesLibresById,
};
