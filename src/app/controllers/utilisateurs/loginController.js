import dbConn from '../../db/pool';
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';
dotenv.config();
const SECRET = process.env.JWT_SECRET;

// ---- LOGIN ---- //
const login = (request, response) => {
  // Read matricule et mot de passe
  const { matricule, password } = request.body;

  // TODO : Chiffrer le mot de passe pour comparaison

  //TODO Utiliser les données du formulaire

  const getUsersQuery = `SELECT * FROM  utilisateurs.utilisateurs
  WHERE matricule = $1 `;
  dbConn.pool.query(getUsersQuery, ['1234'], (error, results) => {
    if (error) {
      // TODO : Gérer les erreurs d'athentification

      throw error;
    }

    //TODO : Vérifier le mot de passe

    // Construction du Json web token
    const accessToken = jwt.sign(
      {
        matricule: results.rows[0].matricule,
        role: results.rows[0].role,
      },
      SECRET,
      { expiresIn: '3 hours' }
    );

    // Renvoyer le token
    response.status(200).send({ accessToken });
  });
};

export default {
  login,
};
