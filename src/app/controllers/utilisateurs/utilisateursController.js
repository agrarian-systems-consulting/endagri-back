import dbConn from '../../db/pool';
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';
dotenv.config();
const SECRET = process.env.JWT_SECRET;

// ---- Liste des utilisateurs ---- //
const getUtilisateurs = (request, response) => {
  const getUsersQuery = `SELECT * FROM  utilisateurs.utilisateurs
  ORDER BY matricule ASC `;
  dbConn.pool.query(getUsersQuery, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(results.rows);
  });
};

// ---- Liste des utilisateurs ---- //
const login = (request, response) => {
  const getUsersQuery = `SELECT * FROM  utilisateurs.utilisateurs
  WHERE matricule = $1 `;
  dbConn.pool.query(getUsersQuery, ['1234'], (error, results) => {
    if (error) {
      throw error;
    }

    const token = jwt.sign(
      {
        matricule: results.rows[0].matricule,
        role: results.rows[0].role,
      },
      SECRET,
      { expiresIn: '3 hours' }
    );

    response.status(200).send(token);
  });
};

export default {
  getUtilisateurs,
  login,
};
