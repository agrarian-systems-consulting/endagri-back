const dbConn = require('./../db/pool')

const getFiches = (request, response) => {
    dbConn.pool.query('SELECT * FROM fiche.fiche_technique ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(results.rows)
    })
}

const setFiche = (request, response) => {
    const { libelle_fiche, id_utilisateur } = request.body

    dbConn.pool.query('INSERT INTO fiche.fiche_technique(id, libelle, id_utilisateur) VALUES (DEFAULT, $1, $2)', [libelle_fiche, id_utilisateur], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`Create`)
    })
}


module.exports = {
    getFiches,
    setFiche,
}