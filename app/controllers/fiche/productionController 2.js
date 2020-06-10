const dbConn = require('../../db/pool')

// CREER VUE
const getProductions = (request, response) => {
    const getProductionsQuery = 'SELECT id,libelle,type_production FROM fiche.production ORDER BY id ASC';
    dbConn.pool.query(getProductionsQuery, (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(results.rows)
    })
}

// A DISCUTER
const postProduction = (request, response) => {
  const { libelle_production,type_production } = request.body
  const postProductionQuery = 'INSERT INTO fiche.production(id,libelle,type_production) VALUES (DEFAULT, $1,$2)';
  dbConn.pool.query(postProductionQuery, [libelle_production, type_production], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Create`)
  })
}

// CREER VUE
const getProductionById = (request, response) => {
  const id_production = request.params.id;
  const getProductionByIdQuery = 'SELECT id,libelle,type_production FROM fiche.production WHERE id=$1';
  dbConn.pool.query(getProductionByIdQuery, [id_production], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(results.rows)
  })
}

// A DISCUTER
const putProductionById = (request, response) => {
  const id_production = request.params.id;
  const { libelle_production,type_production } = request.body;
  const putProductionQuery = 'UPDATE fiche.production SET libelle=$1, type_production=$2 WHERE id=$3';
  dbConn.pool.query(putProductionQuery, [libelle_production,type_production,id_production], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Update`)
  })
}

// DONE
const deleteProductionById = (request, response) => {
  const id_production = request.params.id;
  const deleteProductionByIdQuery = 'DELETE FROM fiche.production WHERE id=$1';
  dbConn.pool.query(deleteProductionByIdQuery, [id_production], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Delete`)
  })
}

module.exports = {
    getProductions,
    postProduction,
    getProductionById,
    putProductionById,
    deleteProductionById,
}