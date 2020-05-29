const dbConn = require('../../db/pool')

// CREER JOINTURE
const getAnalyses = (request, response) => {
    const getAnalysesQuery = `SELECT * FROM analyse_fiche.analyse_tresorie ORDER BY id ASC`;
    dbConn.pool.query(getAnalysesQuery, (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(results.rows)
    })
}

module.exports = {
    getAnalyses,
}