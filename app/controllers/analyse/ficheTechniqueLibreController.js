const dbConn = require('../../db/pool')

// CREER UNE NOUVELLE FICHE
// @Asc v1 Faire en sorte que la response ne soit renvoyée que lorsque les query pour créer les ventes et activités sont resolved (à voir si on garde dépenses et activités dans ce endpoint quand même)
// @Asc v1 Supprimer id_utilisateur si pose problème tant que la table User n'existe pas
// @Enda v2 Gérer id_utilisateur avec la table User
const postFicheTechniqueLibre = (request, response) => {

  const id_analyse = request.params.id_analyse;
  // Destructure les données contenus dans la requête
  const {
    date_ini,
    coeff_surface_ou_nombre_animaux, //swagger à modifier
    coeff_main_oeuvre_familiale,
    coeff_ventes,
    coeff_depenses,
  } = request.body;

  const promiseAjoutFicheTechniqueLibre = () => {
    return new Promise((resolve, reject) => {
      // Construction de la requête pour créer la fiche technique
      const postFicheTechniqueLibreQuery = `INSERT INTO analyse_fiche.fiche_technique_libre(id, date_ini, coeff_surface_ou_nombre_animaux, coeff_main_oeuvre_familiale, id_analyse)
      VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *`;
      // Envoi de la requête asynchrone
      dbConn.pool.query(
        postFicheTechniqueLibreQuery,
        [date_ini, coeff_surface_ou_nombre_animaux, coeff_main_oeuvre_familiale,id_analyse],
        (error, results) => {
          if (error) {
            // Si la requête échoue, reject la Promise
            return reject(error);
          }

          // Récupère l'id de la fiche technique libre qui vient d'être créée
          const id_fiche_technique_libre = results.rows[0].id;

          // La requête est considérée fullfilled et renvoie l'identifiant de la fiche technique libre créée
          resolve(id_fiche_technique_libre);
        }
      );
    });
  };

  const promiseCoeffVente = (coeff_vente, id_fiche_technique_libre) => {
  
    const { libelle_categorie, //swagger à modifier
      coeff_autoconsommation,
      coeff_intraconsommation,
      coeff_rendement } = coeff_vente;

    return new Promise((resolve, reject) => {
      // Construction de la requête pour créer la dépense
      const postCoeffVenteQuery = `INSERT INTO analyse_fiche.coeff_vente(id, id_fiche_technique_libre,libelle_categorie,coeff_autoconsommation,coeff_intraconsommation,coeff_rendement) 
      VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING *`;

      // Envoi de la requête asynchrone
      dbConn.pool.query(
        postCoeffVenteQuery,
        [ id_fiche_technique_libre,
          libelle_categorie, //swagger à modifier
          coeff_autoconsommation,
          coeff_intraconsommation,
          coeff_rendement],
        (error, results) => {
          if (error) {
            // Si la requête échoue
            reject(error);
          }         
          resolve('Coeff Vente ajoutée', results.rows[0]);
        }
      );
    });
  };

  const asyncPromiseCoeffVente = async (coeff_vente, id_fiche_technique_libre) => {
    return promiseCoeffVente(coeff_vente, id_fiche_technique_libre);
  };
  // Permet d'attendre que TOUTES les coeff ventes aient été ajoutées
  const ajouterCoeffVentes = async (id_fiche_technique_libre) => {
    return Promise.all(
      coeff_ventes.map((coeff_vente) => asyncPromiseCoeffVente(coeff_vente, id_fiche_technique_libre))
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
        [ libelle_categorie, coeff_intraconsommation],
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

  const asyncPromiseCoeffDepense = async (coeff_depense, id_fiche_technique_libre) => {
    return promiseCoeffDepense(coeff_depense, id_fiche_technique_libre);
  };
  // Permet d'attendre que TOUTES les coeff ventes aient été ajoutées
  const ajouterCoeffDepenses = async (id_fiche_technique_libre) => {
    return Promise.all(
      coeff_depenses.map((coeff_depense) => asyncPromiseCoeffDepense(coeff_depense, id_fiche_technique_libre))
    );
  };

  const getAnalyse = (id_analyse) => {
    return new Promise((resolve, reject) => {
      // Créé la requête pour récupérer l'activité avec toutes ses dépenses associées
      /*const getActiviteAvecDepensesQuery = `SELECT a.*, 
      array_remove(array_agg(d.*),null) depenses 
      FROM fiche.activite a LEFT JOIN fiche.depense d ON a.id = d.id_activite WHERE a.id=$1 GROUP BY a.id`;

      // Envoi de la requête
      dbConn.pool.query(
        getActiviteAvecDepensesQuery,
        [id_activite],
        (error, results) => {
          if (error) {
            console.log(error);
            throw error;
          }

          // Envoi de la réponse
          resolve(results.rows[0]);
        }
      );*/
    });
  };

  // Fonction pour enchaîner les requêtes asynchrones
  const doAjouterFicheTechniqueLibreEtCoeffVentesEtCoeffDepenses = async () => {
    // Ajouter la Fiche Technique Libre
    const id_fiche_technique_libre = await promiseAjoutFicheTechniqueLibre();

    // S'il y a des coeff ventes, les ajouter en tenant compte de l'id_fiche_technique_libre qui vient d'être créée
    if (coeff_ventes != undefined) {
      await ajouterCoeffVentes(id_fiche_technique_libre);
    }

    if (coeff_depenses != undefined) {
      await ajouterCoeffDepenses(id_fiche_technique_libre);
    }

    // Récupérer...
    const responseBody = await getAnalyse(id_fiche_technique_libre);
    return responseBody;
  };

  // Appel de la fonction asynchrone principale
  doAjouterFicheTechniqueLibreEtCoeffVentesEtCoeffDepenses()
    .then((result) => {
      // Si les requêtes ont fonctionné, renvoyée un HTTP 201 avec le détail de l'activité et des dépenses
      response.status(201).json(result);
    })
    .catch((e) => console.log(chalk.red.bold(e)));
    
  
};

module.exports = {
    postFicheTechniqueLibre,
}