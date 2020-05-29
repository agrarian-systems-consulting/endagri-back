const dbConn = require('./../db/pool')

const getFiches = (request, response) => {
    const getFichesQuery = 'SELECT id,id_production,id_utilisateur,libelle,ini_debut,ini_fin,commentaire FROM fiche.fiche_technique ORDER BY id ASC';
    dbConn.pool.query(getFichesQuery, (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(results.rows)
    })
}

const postFiche = (request, response) => {
  const { libelle_fiche, id_utilisateur } = request.body

  dbConn.pool.query('INSERT INTO fiche.fiche_technique(id, libelle, id_utilisateur) VALUES (DEFAULT, $1, $2)', [libelle_fiche, id_utilisateur], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Create`)
  })
}

const getFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const getFicheByIdQuery = 'SELECT id,id_production,id_utilisateur,libelle,ini_debut,ini_fin,commentaire FROM fiche.fiche_technique WHERE id=$1';
  dbConn.pool.query(getFicheByIdQuery, [id_fiche], (error, results) => {
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
}