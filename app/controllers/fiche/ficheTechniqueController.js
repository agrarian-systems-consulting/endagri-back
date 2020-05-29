const dbConn = require('../../db/pool')

// DONE
const getFiches = (request, response) => {
    const getFichesQuery = 'SELECT id,id_production,id_utilisateur,libelle,ini_debut,ini_fin,commentaire FROM fiche.fiche_technique ORDER BY id ASC';
    dbConn.pool.query(getFichesQuery, (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(results.rows)
    })
}

// A DISCUTER
const postFiche = (request, response) => {
  const { libelle_fiche, id_utilisateur } = request.body
  const postFicheQuery = 'INSERT INTO fiche.fiche_technique(id, libelle, id_utilisateur) VALUES (DEFAULT, $1, $2)';
  dbConn.pool.query(postFicheQuery, [libelle_fiche, id_utilisateur], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Create`)
  })
}

// CREER VUE
const getFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const getFicheByIdQuery = `WITH subquery AS(
    SELECT act.mois_relatif,SUM(d.montant) dep,act.id_fiche_technique,f.libelle FROM fiche.activite act LEFT JOIN fiche.depense d ON act.id=d.id_activite 
    JOIN fiche.fiche_technique f ON act.id_fiche_technique=f.id
    GROUP BY act.mois_relatif,act.id_fiche_technique,f.libelle ORDER BY act.mois_relatif 
   )
   SELECT libelle,JSON_AGG(JSON_BUILD_OBJECT('mois relatif',mois_relatif,'depenses',dep)) flux FROM subquery WHERE subquery.id_fiche_technique=$1 
   GROUP BY libelle`;
  dbConn.pool.query(getFicheByIdQuery, [id_fiche], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(results.rows)
  })
}

// A DISCUTER
const putFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const { libelle_fiche } = request.body;
  const putFicheByIdQuery = 'UPDATE fiche.fiche_technique SET libelle=$1 WHERE id=$2';
  dbConn.pool.query(putFicheByIdQuery, [libelle_fiche,id_fiche], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Update`)
  })
}

// DONE
const deleteFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const deleteFicheByIdQuery = 'DELETE FROM fiche.fiche_technique WHERE id=$1';
  dbConn.pool.query(deleteFicheByIdQuery, [id_fiche], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Delete`)
  })
}

// CREER VUE
const getFicheByIdFluxMensuels = (request, response) => {
  const id_fiche = request.params.id;
  const getFicheByIdFluxMensuelsQuery = 'SELECT * FROM fiche.fiche_technique WHERE id=$1';
  dbConn.pool.query(getFicheByIdFluxMensuelsQuery, [id_fiche], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(results.rows)
  })
}

// CREER VUE
const getFicheByIdFluxCategorie = (request, response) => {
  const id_fiche = request.params.id;
  const getFicheByIdFluxCategorieQuery = 'SELECT * FROM fiche.fiche_technique WHERE id=$1';
  dbConn.pool.query(getFicheByIdFluxCategorieQuery, [id_fiche], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(results.rows)
  })
}

module.exports = {
    getFiches,
    postFiche,
    getFicheById,
    putFicheById,
    deleteFicheById,
    getFicheByIdFluxMensuels,
    getFicheByIdFluxCategorie, 
}