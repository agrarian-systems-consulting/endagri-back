import dbConn from '../../db/pool';

// Problème mineur sur les GET, ils renvoient des prix sous la forme de stings

// ---- LISTER LES MARCHES ----- //
const getMarches = (request, response) => {
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

// ------ LIRE LES VALEURS D'UN MARCHE ----- //
// Problème : Retourne les valeurs de prix sous la forme de strings
const getMarcheById = (request, response) => {
  const id_marche = request.params.id;

  dbConn.pool.query(
    `SELECT * FROM fiche.marche WHERE id=$1`,
    [id_marche],
    (err, res) => {
      if (err) {
        throw err;
      }
      response.status(200).send(res.rows[0]);
    }
  );
};

// ----- MODIFIER UN MARCHE ----- //
const putMarcheById = (request, response) => {
  const id_marche = request.params.id;
  const {
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
  const putMarcheByIdQuery = `UPDATE fiche.marche SET localisation = $2,
    type_marche = $3,
    prix_january = $4,
    prix_february = $5,
    prix_march = $6,
    prix_april = $7,
    prix_may = $8,
    prix_june = $9,
    prix_july = $10,
    prix_august = $11,
    prix_september = $12,
    prix_october = $13,
    prix_november = $14,
    prix_december = $15,
    commentaire = $16 
    WHERE id=$1 RETURNING *`;
  dbConn.pool.query(
    putMarcheByIdQuery,
    [
      id_marche,
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
      response.status(200).send(res.rows[0]);
    }
  );
};

// ----- SUPPRIMER UN MARCHE ----- //
const deleteMarcheById = (request, response) => {
  const id_marche = request.params.id;
  dbConn.pool.query(
    'DELETE FROM fiche.marche WHERE id=$1 RETURNING *',
    [id_marche],
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

export default {
  getMarches,
  postMarche,
  getMarcheById,
  putMarcheById,
  deleteMarcheById,
};
