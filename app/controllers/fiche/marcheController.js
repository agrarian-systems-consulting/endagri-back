import dbConn from '../../db/pool';

// ---- LISTER LES MARCHES ----- //
// Ajouter le param optionnel dans Swagger
const getMarches = (request, response) => {
  // Récupère le paramètre optionnel id_utilisateur pour filtrer les fiches techniques
  const id_production = request.query.id_production;

  if (id_production !== undefined) {
    const getMarchesByIdProductionQuery = `
    SELECT m.*, p.id_production, p.libelle as libelle_produit, p.unite, prod.libelle as libelle_production
    FROM fiche.marche m 
    LEFT JOIN fiche.produit p ON m.id_produit = p.id
    LEFT JOIN fiche.production prod ON p.id_production = prod.id WHERE prod.id=$1
    ORDER BY p.id_production ASC`;
    dbConn.pool.query(
      getMarchesByIdProductionQuery,
      [id_production],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).send(results.rows);
      }
    );
  } else {
    const getMarchesQuery = `
    SELECT m.*, p.id_production, p.libelle as libelle_produit, p.unite, prod.libelle as libelle_production
    FROM fiche.marche m 
    LEFT JOIN fiche.produit p ON m.id_produit = p.id
    LEFT JOIN fiche.production prod ON p.id_production = prod.id 
    ORDER BY p.id_production ASC`;
    dbConn.pool.query(getMarchesQuery, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(results.rows);
    });
  }
};

// ----- CREER UN NOUVEAU MARCHE ----- //
const postMarche = (request, response) => {
  const {
    id_produit,
    localisation,
    type_marche,
    prix_january,
    prix_february,
    prix_march,
    prix_april,
    prix_may,
    prix_june,
    prix_july,
    prix_august,
    prix_september,
    prix_october,
    prix_november,
    prix_december,
    commentaire,
  } = request.body;

  const postMarcheQuery = `INSERT INTO fiche.marche(id,id_produit, localisation, type_marche, prix_january, prix_february, prix_march, prix_april, prix_may, prix_june, prix_july, prix_august, prix_september, prix_october, prix_november, prix_december,commentaire) 
    VALUES (DEFAULT, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`;
  dbConn.pool.query(
    postMarcheQuery,
    [
      id_produit,
      localisation,
      type_marche,
      prix_january,
      prix_february,
      prix_march,
      prix_april,
      prix_may,
      prix_june,
      prix_july,
      prix_august,
      prix_september,
      prix_october,
      prix_november,
      prix_december,
      commentaire,
    ],
    (err, res) => {
      if (err) {
        throw err;
      }

      response.status(201).send(res.rows[0]);
    }
  );
};

// RECUPERER LES VALEURS D'UN MARCHE
// CREER VUE
const getMarcheById = (request, response) => {
  // Récupère l'identifiant du marché recherché
  const id_marche = request.params.id;
  const getMarcheByIdQuery = `SELECT id,id_produit,type_marche,localisation,prix_janvier,prix_fevrier,prix_mars,prix_avril,prix_mai,prix_juin
  prix_juillet,prix_aout,prix_septembre,prix_octobre,prix_novembre,prix_decembre FROM fiche.marche WHERE id=$1`;
  dbConn.pool.query(getMarcheByIdQuery, [id_marche], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
};

// A DISCUTER
const putMarcheById = (request, response) => {
  const id_marche = request.params.id;
  const { id_produit, type_marche } = request.body;
  const putMarcheByIdQuery =
    'UPDATE fiche.marche SET id_produit=$1, type_marche=$2 WHERE id=$3';
  dbConn.pool.query(
    putMarcheByIdQuery,
    [id_produit, type_marche, id_marche],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Update`);
    }
  );
};

// DONE
const deleteMarcheById = (request, response) => {
  const id_marche = request.params.id;
  const deleteMarcheByIdQuery = 'DELETE FROM fiche.marche WHERE id=$1';
  dbConn.pool.query(deleteMarcheByIdQuery, [id_marche], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Delete`);
  });
};

export {
  getMarches,
  postMarche,
  getMarcheById,
  putMarcheById,
  deleteMarcheById,
};
