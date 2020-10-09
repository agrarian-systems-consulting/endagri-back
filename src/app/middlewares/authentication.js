import dbConn from '../../app/db/pool';
import dotenv from 'dotenv';
dotenv.config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware pour l'authentication des utilisateurs
export default function authenticate(request, response, next) {
  // Récupère le token depuis le header de la requête
  const token =
    request.headers.authorization &&
    extractBearerToken(request.headers.authorization);

  // Teste la présence d'un token
  if (!token) {
    return response.status(401).json({
      message:
        "Cette requête nécessite l'envoi d'un token Authorization au format 'Bearer header.payload.signature'",
    });
  }

  // Vérifie le token
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    // Si le token est incorrect
    if (err) {
      return response.status(403).json({
        message: `Le token fourni n'est pas valide : ${err}`,
      });
    } else {
      //S'il est correct on ajoute le matricule et le rôle à la requête
      request.user = decodedToken; // Ajoute la propriété user à la requête

      next(); // Passe au middleware suivant
    }
  });
}

// Fonction pour extraire le token dans le header de la requête
const extractBearerToken = (headerValue) => {
  if (typeof headerValue !== 'string') {
    return false;
  }

  // S'assure de la bonne structure du token, au format 'Bearer header.payload.signature'
  const matches = headerValue.match(/(bearer)\s+(\S+)/i);
  return matches && matches[2];
};
