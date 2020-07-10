import dbConn from '../../db/pool';

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

    // Récupérer...
    // const responseBody = await getAnalyse(id_fiche_technique_libre);
    return fiche_technique_libre;
  };

  // Appel de la fonction asynchrone principale
  doWork()
    .then((result) => {
      response.status(200).json(result);
    })
    .catch((e) => console.log(chalk.red.bold(e)));
};

export default {
  postFicheTechniqueLibre,
};
