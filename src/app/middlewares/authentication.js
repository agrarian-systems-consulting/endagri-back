import dbConn from '../../app/db/pool';
import dotenv from 'dotenv';
import chalk from 'chalk';
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
    console.error(chalk.red('Pas de token associé à cette requête.'));
    return response.status(401).json({
      message:
        "Cette requête nécessite l'envoi d'un token Authorization au format 'Bearer header.payload.signature'",
    });
  }

  // Vérifie le token
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    // Si le token est incorrect
    if (err) {
      console.error(chalk.red("Erreur lors d'une authentification : ", err));
      return response.status(403).json({
        message: `Le token fourni n'est pas valide : ${err}`,
      });
    } else {
      //S'il est correct on ajoute le matricule et le rôle à la requête
      request.user = decodedToken; // Ajoute la propriété user à la requête
      console.log(
        `\nRequête faîte avec le matricule ${decodedToken.matricule} loggué en tant que  ${decodedToken.role} :`
      );
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
