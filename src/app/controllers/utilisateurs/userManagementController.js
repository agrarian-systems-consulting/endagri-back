import dbConn from '../../db/pool';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ---- LISTER DES UTILISATEURS ---- //
const getUtilisateurs = (request, response) => {
  dbConn.pool.query(
    'SELECT * FROM utilisateurs.utilisateurs ORDER BY matricule ASC',
    (err, res) => {
      if (err) {
        console.error(err);
        response.sendStatus(500);
      }
      response.status(200).send(res.rows);
    }
  );
};

// ---- REGISTER ---- //
const postUtilisateur = (request, response) => {
  // Récupère le matricule, le mot de passe et le rôle assigné
  const { matricule, password, role } = request.body;

  // Chiffrer le mot de passe avec bcrypt
  const saltRounds = 10;

  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hashedPassword) {
      if (err) {
        console.error(err);
        return response.status(500).json({ err });
      }

      // Sauvegarder l'utilisateur en base de données avec le mot de passe chiffré
      dbConn.pool.query(
        `INSERT INTO
        utilisateurs.utilisateurs(matricule, password, role)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [matricule, hashedPassword, role],
        (err, res) => {
          if (err) {
            console.error(err);
            return response.status(404).json({ err });
          }

          const { password, ...userWithoutPassword } = res.rows[0]; // Retire le mot de passe

          return response.status(200).json(userWithoutPassword);
        }
      );
    });
  });
};
// ---- SUPPRIMER UN UTILISATEUR ---- //
// Attention : avec cette opération, il faut s'assurer que la suppression de l'utilisateur n'entraîne pas l'impossibilité d'accéder à certaines données dont il était auteur, ou sur lequel il était le seul à avoir des droits.
const deleteUser = (request, response) => {
  // Récupère le matricule depuis les params
  const { matricule } = request.params;

  // Sauvegarder l'utilisateur en base de données avec le mot de passe chiffré
  dbConn.pool.query(
    `DELETE FROM
        utilisateurs.utilisateurs
        WHERE matricule = $1
        RETURNING *`,
    [matricule],
    (err, res) => {
      if (err) {
        console.error(err);
        return response.status(404).json({ err });
      }

      return response.status(200).json(res.rows[0]);
    }
  );
};

export default {
  getUtilisateurs,
  postUtilisateur,
  deleteUser,
};
