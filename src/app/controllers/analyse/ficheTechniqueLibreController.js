import dbConn from '../../db/pool';
import _ from 'lodash';
// ---- CREER UNE NOUVELLE FICHE TECHNIQUE LIBRE DANS UNE ANALYSE ---- //

const postFicheTechniqueLibre = (request, response) => {
  const id_analyse = request.params.id;
  // Destructure les données contenus dans la requête
  const {
    id_fiche_technique,
    date_ini,
    coeff_surface_ou_nombre_animaux,
    coeff_main_oeuvre_familiale,
    coeff_ventes,
    coeff_depenses,
  } = request.body;

  const promiseAjoutFicheTechniqueLibre = () => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `
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
      RETURNING *`,
        [
          id_fiche_technique,
          date_ini,
          coeff_surface_ou_nombre_animaux,
          coeff_main_oeuvre_familiale,
          id_analyse,
        ],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(res.rows[0]);
        }
      );
    });
  };

  const promiseCoeffVente = (coeff_vente, id_fiche_technique_libre) => {
    const {
      libelle_categorie,
      coeff_autoconsommation,
      coeff_intraconsommation,
      coeff_rendement,
    } = coeff_vente;

    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `INSERT INTO 
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
        RETURNING *`,
        [
          id_fiche_technique_libre,
          libelle_categorie,
          coeff_autoconsommation,
          coeff_intraconsommation,
          coeff_rendement,
        ],
        (error, results) => {
          if (error) {
            reject(error);
          }
          resolve(results.rows[0]);
        }
      );
    });
  };

  // Permet d'attendre que TOUTES les coeff ventes aient été ajoutées
  const ajouterCoeffVentes = async (id_fiche_technique_libre) => {
    return Promise.all(
      coeff_ventes.map(
        async (coeff_vente) =>
          await promiseCoeffVente(coeff_vente, id_fiche_technique_libre)
      )
    );
  };

  ////
  const promiseCoeffDepense = (coeff_depense, id_fiche_technique_libre) => {
    const { libelle_categorie, coeff_intraconsommation } = coeff_depense;

    return new Promise((resolve, reject) => {
      // Construction de la requête pour créer la dépense
      const postCoeffDepenseQuery = `INSERT INTO analyse_fiche.coeff_depense(id, id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation) 
      VALUES (DEFAULT, $1, $2, $3) RETURNING *`;

      // Envoi de la requête asynchrone
      dbConn.pool.query(
        postCoeffDepenseQuery,
        [libelle_categorie, coeff_intraconsommation],
        (error, results) => {
          if (error) {
            // Si la requête échoue
            reject(error);
          }
          resolve('Coeff Dépense ajoutée', results.rows[0]);
        }
      );
    });
  };

  // Permet d'attendre que TOUTES les coeff ventes aient été ajoutées
  const ajouterCoeffDepenses = async (id_fiche_technique_libre) => {
    return Promise.all(
      coeff_depenses.map((coeff_depense) =>
        promiseCoeffDepense(coeff_depense, id_fiche_technique_libre)
      )
    );
  };

  const promiseGetFicheComplete = (id_fiche_technique_libre) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT 
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
        f.id, ft.id, p.id`,
        [id_fiche_technique_libre],
        (error, results) => {
          if (error) {
            reject(error);
          }
          resolve(results.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async () => {
    // Ajouter la Fiche Technique Libre
    const fiche_technique_libre = await promiseAjoutFicheTechniqueLibre();

    // if (coeff_ventes != undefined) {
    //   await ajouterCoeffVentes(id_fiche_technique_libre);
    // }

    // if (coeff_depenses != undefined) {
    //   await ajouterCoeffDepenses(id_fiche_technique_libre);
    // }

    const ficheComplete = await promiseGetFicheComplete(
      fiche_technique_libre.id
    );
    return ficheComplete;
  };

  // Appel de la fonction asynchrone principale
  doWork()
    .then((result) => {
      response.status(200).json(result);
    })
    .catch((e) => console.log(chalk.red.bold(e)));
};

// --- LIRE UNE FICHE TECHNIQUE LIBRE --- //
const getFicheTechniqueLibre = (request, response) => {
  const { id_ftl } = request.params;

  const promiseGetFicheComplete = (id_ftl) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT 
        ftl.*,
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
            'id', ven.id,
            'libelle_categorie', ven.libelle_categorie,
            'coeff_intraconsommation', ven.coeff_intraconsommation,
            'coeff_autoconsommation', ven.coeff_autoconsommation,
            'coeff_rendement', ven.coeff_rendement,
            'localisation', m.localisation,
            'type_marche', m.type_marche,
            'libelle_produit', prod.libelle
          )
        ) coeff_ventes
       
      FROM 
        analyse_fiche.fiche_technique_libre ftl
      LEFT JOIN analyse_fiche.coeff_depense d
        ON ftl.id = d.id_fiche_technique_libre::integer
      LEFT JOIN analyse_fiche.coeff_vente ven
        ON ftl.id = ven.id_fiche_technique_libre::integer
      LEFT JOIN fiche.marche m
        ON ven.libelle_categorie::integer = m.id
      LEFT JOIN fiche.produit prod
        ON m.id_produit::integer = prod.id
      LEFT JOIN fiche.fiche_technique ft
        ON ft.id = ftl.id_fiche_technique::integer
      LEFT JOIN fiche.production p
        ON ft.id_production::integer = p.id
      WHERE 
        ftl.id=$1
      GROUP BY 
        ftl.id, ft.id, p.id,ven.id,m.id, prod.id`,
        [id_ftl],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(error);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async (id_ftl) => {
    let ficheComplete = await promiseGetFicheComplete(id_ftl);

    // Supprimer les valeurs nulles
    ficheComplete.coeff_depenses = ficheComplete.coeff_depenses.filter(
      (c) => c.id !== null
    );
    ficheComplete.coeff_ventes = ficheComplete.coeff_ventes.filter(
      (c) => c.id !== null
    );

    return ficheComplete;
  };

  // Appel de la fonction asynchrone principale
  doWork(id_ftl)
    .then((res) => {
      response.status(200).json(res);
    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
};

// --- SUPPRIMER UNE FICHE TECHNIQUE LIBRE --- //
const deleteFicheTechniqueLibre = (request, response) => {
  const id = request.params.id;

  const promiseDeleteFicheTechniqueLibre = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `
      DELETE FROM
      analyse_fiche.fiche_technique_libre WHERE id=$1 RETURNING *`,
        [id],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(res.rows[0]);
        }
      );
    });
  };

  const promiseDeleteCoeffVente = (id_fiche_technique_libre) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `DELETE FROM
        analyse_fiche.coeff_vente WHERE id_fiche_technique_libre=$1
        RETURNING *`,
        [id_fiche_technique_libre],
        (error, results) => {
          if (error) {
            reject(error);
          }
          resolve(results.rows[0]);
        }
      );
    });
  };

  const promiseDeleteCoeffDepense = (id_fiche_technique_libre) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `DELETE FROM
        analyse_fiche.coeff_depense WHERE id_fiche_technique_libre=$1
        RETURNING *`,
        [id_fiche_technique_libre],
        (error, results) => {
          if (error) {
            reject(error);
          }
          resolve(results.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async (id) => {
    await promiseDeleteFicheTechniqueLibre(id);
    await promiseDeleteCoeffDepense(id);
    await promiseDeleteCoeffVente(id);
    return;
  };

  // Appel de la fonction asynchrone principale
  doWork(id)
    .then((res) => {
      response.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
};

// --- AJOUTER UN COEFF DEPENSE A UNE FICHE TECHNIQUE LIBRE --- //
const postCoeffDepense = (request, response) => {
  const {
    id_fiche_technique_libre,
    libelle_categorie,
    coeff_intraconsommation,
  } = request.body;

  const promisePostCoeffDepense = (
    id_fiche_technique_libre,
    libelle_categorie,
    coeff_intraconsommation
  ) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `INSERT INTO analyse_fiche.coeff_depense(
          id,
          id_fiche_technique_libre,
          libelle_categorie,
          coeff_intraconsommation
          )
        VALUES (DEFAULT, $1, $2, $3)
        RETURNING *`,
        [id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(error);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async (
    id_fiche_technique_libre,
    libelle_categorie,
    coeff_intraconsommation
  ) => {
    let coeff_depense = await promisePostCoeffDepense(
      id_fiche_technique_libre,
      libelle_categorie,
      coeff_intraconsommation
    );
    return coeff_depense;
  };

  // Appel de la fonction asynchrone principale
  doWork(id_fiche_technique_libre, libelle_categorie, coeff_intraconsommation)
    .then((res) => {
      response.status(200).json(res);
    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
};

// --- SUPPRIMER UN COEFF DEPENSE --- //
const deleteCoeffDepense = (request, response) => {
  const { id } = request.params;

  const promiseDeleteCoeffDepense = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `DELETE FROM analyse_fiche.coeff_depense WHERE id=$1 RETURNING *`,
        [id],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(error);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async (id) => {
    await promiseDeleteCoeffDepense(id);
    return;
  };

  // Appel de la fonction asynchrone principale
  doWork(id)
    .then((res) => {
      response.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
};

// --- AJOUTER UN COEFF VENTE A UNE FICHE TECHNIQUE LIBRE --- //
const postCoeffVente = (request, response) => {
  const {
    id_fiche_technique_libre,
    libelle_categorie,
    coeff_intraconsommation,
    coeff_autoconsommation,
    coeff_rendement,
  } = request.body;

  const promisePostCoeffVente = (
    id_fiche_technique_libre,
    libelle_categorie,
    coeff_intraconsommation,
    coeff_autoconsommation,
    coeff_rendement
  ) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `INSERT INTO analyse_fiche.coeff_vente(
          id,
          id_fiche_technique_libre,
          libelle_categorie,
          coeff_intraconsommation,
          coeff_autoconsommation,
          coeff_rendement
          )
        VALUES (DEFAULT, $1, $2, $3,$4,$5)
        RETURNING *`,
        [
          id_fiche_technique_libre,
          libelle_categorie,
          coeff_intraconsommation,
          coeff_autoconsommation,
          coeff_rendement,
        ],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(error);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  const getCoeffVenteComplete = (id_coeff_vente) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` SELECT 
            cv.*,
            m.localisation,
            m.type_marche,
            p.libelle libelle_produit
          FROM analyse_fiche.coeff_vente cv
          LEFT JOIN analyse_fiche.fiche_technique_libre ftl
            ON ftl.id = cv.id_fiche_technique_libre::integer
          LEFT JOIN fiche.fiche_technique ft
            ON ft.id = ftl.id_fiche_technique::integer
          LEFT JOIN fiche.vente v
            ON ft.id = v.id_fiche_technique::integer
          LEFT JOIN fiche.marche m
            ON m.id = v.id_marche::integer
          LEFT JOIN fiche.produit p
            ON p.id = m.id_produit::integer
          WHERE cv.id=$1
          GROUP BY cv.id, ftl.id, ft.id, v.id, m.id, p.id`,
        [id_coeff_vente],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(error);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async (
    id_fiche_technique_libre,
    libelle_categorie,
    coeff_intraconsommation,
    coeff_autoconsommation,
    coeff_rendement
  ) => {
    let coeff_vente = await promisePostCoeffVente(
      id_fiche_technique_libre,
      libelle_categorie,
      coeff_intraconsommation,
      coeff_autoconsommation,
      coeff_rendement
    );

    const coeff_vente_complet = await getCoeffVenteComplete(coeff_vente.id);
    return coeff_vente_complet;
  };

  // Appel de la fonction asynchrone principale
  doWork(
    id_fiche_technique_libre,
    libelle_categorie,
    coeff_intraconsommation,
    coeff_autoconsommation,
    coeff_rendement
  )
    .then((res) => {
      response.status(200).json(res);
    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
};

// --- SUPPRIMER UN COEFF VENTE --- //
const deleteCoeffVente = (request, response) => {
  const { id } = request.params;

  const promiseDeleteCoeffVente = (id) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        `DELETE FROM analyse_fiche.coeff_vente WHERE id=$1 RETURNING *`,
        [id],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(error);
          }
          resolve(res.rows[0]);
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async (id) => {
    await promiseDeleteCoeffVente(id);
    return;
  };

  // Appel de la fonction asynchrone principale
  doWork(id)
    .then((res) => {
      response.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
};

// --- LIRE LES PRODUITS FICHE TECHNIQUE LIBRE --- //
const getProduitsFromFicheTechniqueLibre = (request, response) => {
  const { id, id_ftl } = request.params;

  const promiseGetProduitsFromFicheComplete = (id_ftl) => {
    return new Promise((resolve, reject) => {
      dbConn.pool.query(
        ` 
      SELECT
      m.type_marche,
      m.localisation,
      p.libelle libelle_produit,
      m.id id_marche
      FROM 
        analyse_fiche.fiche_technique_libre f
      LEFT JOIN 
        fiche.fiche_technique ft
        ON ft.id = f.id_fiche_technique::integer
      LEFT JOIN fiche.vente v
        ON v.id_fiche_technique::integer = ft.id
      LEFT JOIN fiche.marche m
        ON v.id_marche::integer = m.id
      LEFT JOIN fiche.produit p
        ON m.id_produit::integer = p.id
      WHERE 
        f.id=$1
      GROUP BY 
        v.id, m.id, p.id`,
        [id_ftl],
        (err, res) => {
          if (err) {
            console.log(err);
            reject(error);
          }
          // Remove duplicates before resolving
          resolve(_.uniqBy(res.rows, 'id_marche'));
        }
      );
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doWork = async (id_ftl) => {
    let produits = await promiseGetProduitsFromFicheComplete(id_ftl);

    return produits;
  };

  // Appel de la fonction asynchrone principale
  doWork(id_ftl)
    .then((res) => {
      response.status(200).json(res);
    })
    .catch((err) => {
      console.log(err);
      response.sendStatus(500);
    });
};

export default {
  postFicheTechniqueLibre,
  getFicheTechniqueLibre,
  deleteFicheTechniqueLibre,
  postCoeffDepense,
  deleteCoeffDepense,
  postCoeffVente,
  deleteCoeffVente,
  getProduitsFromFicheTechniqueLibre,
};
