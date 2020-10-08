import dbConn from '../../app/db/pool';
import dotenv from 'dotenv';
dotenv.config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware pour l'authentication des utilisateurs
export default function authenticate(request, response, next) {
  // Récupère le token depuis le header de la requête
  const token = request.headers['x-api-token'];

  // Teste la présence d'un token
  if (!token) {
    return response.status(401).json({
      message: "Cette requête nécessite l'envoi d'un token",
    });
  }

  // Vérifie le token
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    // Si le token est incorrect
    if (err) {
      return response.status(401).json({
        message: `Il y a un problème avec le token fourni : ${err}`,
      });
    } else {
      // S'il est correct, récupérer l'utilisateur associé au token
      const getUserByMatriculeQuery = `
      SELECT * 
      FROM  utilisateurs.utilisateurs
      WHERE matricule = $1 `;
      dbConn.pool.query(
        getUserByMatriculeQuery,
        [decodedToken.matricule],
        (error, results) => {
          if (error) {
            return _response.status(401).json({ message: error });
            throw error;
          }

          const { password, ...userWithoutPassword } = results.rows[0]; // Permet d'enlever le mot de passe

          request.user = userWithoutPassword; // Ajoute la propriété user à la requête

          // Passe au middleware suivant
          next();
        }
      );
    }
  });
}
