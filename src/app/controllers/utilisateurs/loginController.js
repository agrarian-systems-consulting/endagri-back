import dbConn from '../../db/pool';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const SECRET = process.env.JWT_SECRET;

// ---- LOGIN ---- //
const login = (request, response) => {
  // Read matricule et mot de passe
  const { matricule } = request.body;
  const PlaintextPassword = request.body.password;

  // Requête SQL pour récupérer les informations de l'utilisateur en base de données
  const getUserQuery = `
  SELECT * 
  FROM  utilisateurs.utilisateurs
  WHERE matricule = $1 `;
  dbConn.pool.query(getUserQuery, [matricule], (error, results) => {
    if (error) {
      console.log(error);
      throw error;
    }

    console.log(results.rows[0]);
    // Récupère le mot de passe chiffré dans la base de données
    const hashedPassword = results.rows[0].password;

    // Compare le mot de passe envoyé avec celui chiffré en base de données
    bcrypt.compare(PlaintextPassword, hashedPassword, function (err, result) {
      if (err) {
        console.log(err);
        response.sendStatus(500);
        throw err;
      }

      // Si tout est validé, renvoie un token valide
      if (result == true) {
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
      } else {
        response.sendStatus(401);
      }
    });
  });
};

export default {
  login,
};
